/**
 * Redis Cloud Adapter for Brolostack
 * Enterprise-grade Redis integration for caching, sessions, and real-time data
 */

import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface RedisCloudConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  database?: number;
  tls?: boolean;
  cluster?: {
    enabled: boolean;
    nodes: Array<{ host: string; port: number }>;
  };
  sentinel?: {
    enabled: boolean;
    masterName: string;
    sentinels: Array<{ host: string; port: number }>;
  };
  poolSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  commandTimeout?: number;
}

export interface RedisOperation {
  command: string;
  args: any[];
  database?: number;
}

export class RedisCloudAdapter extends EventEmitter implements CloudAdapter {
  public readonly name = 'redis-cloud';
  public readonly provider = 'Redis Cloud';
  
  private config: RedisCloudConfig;
  private connected = false;
  private errorCount = 0;
  private lastError?: string;
  private lastSync?: Date;
  private lastBackup?: Date;
  private logger: Logger;

  constructor(config: RedisCloudConfig) {
    super();
    this.config = {
      database: 0,
      tls: true,
      poolSize: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      commandTimeout: 5000,
      ...config
    };
    this.logger = new Logger(false, 'RedisCloudAdapter');
  }

  async connect(): Promise<void> {
    try {
      // Test connection with PING command
      await this.executeCommand('PING');
      
      this.connected = true;
      this.emit('connected', { adapter: this.name });
      this.logger.info('Connected to Redis Cloud');
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      this.emit('error', { error, adapter: this.name });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.executeCommand('QUIT');
    } catch (error) {
      this.logger.warn('Error during disconnect:', error);
    }

    this.connected = false;
    this.emit('disconnected', { adapter: this.name });
    this.logger.info('Disconnected from Redis Cloud');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Redis Cloud adapter is not connected');
    }

    try {
      const key = 'brolostack:sync:data';
      const serializedData = JSON.stringify(data);
      
      await this.executeCommand('SET', key, serializedData);
      await this.executeCommand('EXPIRE', key, 86400); // 24 hours TTL
      
      this.lastSync = new Date();
      this.emit('sync-completed', { data, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Sync failed';
      this.emit('sync-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async backup(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Redis Cloud adapter is not connected');
    }

    try {
      const backupKey = `brolostack:backup:${Date.now()}`;
      const serializedData = JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        checksum: this.generateChecksum(data)
      });
      
      await this.executeCommand('SET', backupKey, serializedData);
      
      // Add to backup index
      await this.executeCommand('ZADD', 'brolostack:backup:index', Date.now(), backupKey);
      
      // Keep only last 100 backups
      await this.executeCommand('ZREMRANGEBYRANK', 'brolostack:backup:index', 0, -101);
      
      this.lastBackup = new Date();
      this.emit('backup-completed', { data, backupKey, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      this.emit('backup-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('Redis Cloud adapter is not connected');
    }

    try {
      const key = 'brolostack:sync:data';
      const serializedData = await this.executeCommand('GET', key);
      
      if (!serializedData) {
        throw new Error('No sync data found');
      }
      
      const data = JSON.parse(serializedData);
      this.emit('restore-completed', { data, adapter: this.name });
      return data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      this.emit('restore-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Redis Cloud adapter is not connected');
    }

    try {
      const key = `brolostack:store:${storeName}`;
      const serializedData = JSON.stringify(data);
      
      await this.executeCommand('SET', key, serializedData);
      await this.executeCommand('EXPIRE', key, 86400); // 24 hours TTL
      
      this.emit('store-sync-completed', { storeName, data, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Store sync failed';
      this.emit('store-sync-failed', { storeName, error, adapter: this.name });
      throw error;
    }
  }

  async restoreStore(storeName: string): Promise<any> {
    if (!this.connected) {
      throw new Error('Redis Cloud adapter is not connected');
    }

    try {
      const key = `brolostack:store:${storeName}`;
      const serializedData = await this.executeCommand('GET', key);
      
      if (!serializedData) {
        return null;
      }
      
      const data = JSON.parse(serializedData);
      this.emit('store-restore-completed', { storeName, data, adapter: this.name });
      return data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Store restore failed';
      this.emit('store-restore-failed', { storeName, error, adapter: this.name });
      throw error;
    }
  }

  // Redis-specific methods
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl) {
      await this.executeCommand('SETEX', key, ttl, serializedValue);
    } else {
      await this.executeCommand('SET', key, serializedValue);
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.executeCommand('GET', key);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string if not JSON
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.executeCommand('DEL', key);
    return result === 1;
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.executeCommand('EXISTS', key);
    return result === 1;
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.executeCommand('EXPIRE', key, ttl);
    return result === 1;
  }

  // Hash operations
  async hset(key: string, field: string, value: any): Promise<void> {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.executeCommand('HSET', key, field, serializedValue);
  }

  async hget(key: string, field: string): Promise<any> {
    const value = await this.executeCommand('HGET', key, field);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    const result = await this.executeCommand('HGETALL', key);
    const hash: Record<string, any> = {};
    
    for (let i = 0; i < result.length; i += 2) {
      const field = result[i];
      const value = result[i + 1];
      
      try {
        hash[field] = JSON.parse(value);
      } catch {
        hash[field] = value;
      }
    }
    
    return hash;
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map(v => typeof v === 'string' ? v : JSON.stringify(v));
    return await this.executeCommand('LPUSH', key, ...serializedValues);
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map(v => typeof v === 'string' ? v : JSON.stringify(v));
    return await this.executeCommand('RPUSH', key, ...serializedValues);
  }

  async lpop(key: string): Promise<any> {
    const value = await this.executeCommand('LPOP', key);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const values = await this.executeCommand('LRANGE', key, start, stop);
    
    return values.map((value: string) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    });
  }

  // Set operations
  async sadd(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map(m => typeof m === 'string' ? m : JSON.stringify(m));
    return await this.executeCommand('SADD', key, ...serializedMembers);
  }

  async smembers(key: string): Promise<any[]> {
    const members = await this.executeCommand('SMEMBERS', key);
    
    return members.map((member: string) => {
      try {
        return JSON.parse(member);
      } catch {
        return member;
      }
    });
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<number> {
    const serializedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    return await this.executeCommand('PUBLISH', channel, serializedMessage);
  }

  async subscribe(channel: string, _callback: (message: any) => void): Promise<void> {
    // This would require a separate connection for pub/sub
    // Implementation would depend on the Redis client library
    this.emit('subscribed', { channel });
  }

  // Stream operations (Redis Streams)
  async xadd(stream: string, fields: Record<string, any>): Promise<string> {
    const args = ['*']; // Auto-generate ID
    
    Object.entries(fields).forEach(([field, value]) => {
      args.push(field);
      args.push(typeof value === 'string' ? value : JSON.stringify(value));
    });
    
    return await this.executeCommand('XADD', stream, ...args);
  }

  async xread(streams: Record<string, string>, count?: number, block?: number): Promise<any> {
    const args = [];
    
    if (count) {
      args.push('COUNT', count);
    }
    
    if (block !== undefined) {
      args.push('BLOCK', block);
    }
    
    args.push('STREAMS');
    
    Object.entries(streams).forEach(([stream, _id]) => {
      args.push(stream);
    });
    
    Object.values(streams).forEach(id => {
      args.push(id);
    });
    
    return await this.executeCommand('XREAD', ...args);
  }

  // Analytics and monitoring
  async getInfo(): Promise<Record<string, any>> {
    const info = await this.executeCommand('INFO');
    
    // Parse Redis INFO response
    const parsed: Record<string, any> = {};
    const sections = info.split('\r\n\r\n');
    
    sections.forEach((section: string) => {
      const lines = section.split('\r\n');
      const firstLine = lines[0];
      const sectionName = firstLine ? firstLine.replace('# ', '') : 'unknown';
      parsed[sectionName] = {};
      
      lines.slice(1).forEach((line: string) => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (sectionName && key) {
            parsed[sectionName][key] = isNaN(Number(value)) ? value : Number(value);
          }
        }
      });
    });
    
    return parsed;
  }

  async getMemoryUsage(): Promise<{
    used: number;
    peak: number;
    total: number;
    available: number;
    fragmentation: number;
  }> {
    const info = await this.getInfo();
    const memory = info['Memory'] || {};
    
    return {
      used: memory.used_memory || 0,
      peak: memory.used_memory_peak || 0,
      total: memory.total_system_memory || 0,
      available: memory.available_memory || 0,
      fragmentation: memory.mem_fragmentation_ratio || 1
    };
  }

  // Private methods
  private async executeCommand(command: string, ...args: any[]): Promise<any> {
    try {
      // This would use a Redis client library
      // For now, we'll simulate with HTTP requests to a Redis HTTP proxy
      const response = await fetch(`${this.getRedisEndpoint()}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify({
          command,
          args,
          database: this.config.database
        }),
        signal: AbortSignal.timeout(this.config.commandTimeout!)
      });

      if (!response.ok) {
        throw new Error(`Redis command failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      this.logger.error(`Redis command failed: ${command}`, error);
      throw error;
    }
  }

  private getRedisEndpoint(): string {
    const protocol = this.config.tls ? 'https' : 'http';
    return `${protocol}://${this.config.host}:${this.config.port}`;
  }

  private getAuthHeader(): string {
    if (this.config.username && this.config.password) {
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      return `Basic ${credentials}`;
    } else if (this.config.password) {
      return `Bearer ${this.config.password}`;
    }
    return '';
  }

  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  getStatus(): CloudAdapterStatus {
    return {
      connected: this.connected,
      lastSync: this.lastSync || new Date(0),
      lastBackup: this.lastBackup || new Date(0),
      errorCount: this.errorCount,
      lastError: this.lastError ?? undefined
    };
  }

  getCapabilities(): CloudAdapterCapabilities {
    return {
      supportsSync: true,
      supportsBackup: true,
      supportsRestore: true,
      supportsRealTime: true,
      maxDataSize: 512 * 1024 * 1024, // 512MB
      supportedFormats: ['json', 'string', 'binary']
    };
  }
}
