/**
 * PostgreSQL Cloud Adapter for Brolostack
 * Provides secure, enterprise-grade PostgreSQL integration
 */

import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { EventEmitter } from '../../utils/EventEmitter';

export interface PostgreSQLConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  schema?: string;
  poolSize?: number;
  connectionTimeout?: number;
}

export interface PostgreSQLQueryOptions {
  table: string;
  where?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export class PostgreSQLAdapter extends EventEmitter implements CloudAdapter {
  public readonly name = 'postgresql';
  public readonly provider = 'PostgreSQL';
  
  private config: PostgreSQLConfig;
  private connected = false;
  private errorCount = 0;
  private lastError?: string;
  private lastSync?: Date;
  private lastBackup?: Date;

  constructor(config: PostgreSQLConfig) {
    super();
    this.config = config;
  }

  async connect(config?: PostgreSQLConfig): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // In browser environment, we'll use HTTP endpoints to communicate with PostgreSQL
      // This ensures security by not exposing database credentials on the client
      const response = await fetch('/api/database/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'postgresql',
          config: this.sanitizeConfig()
        })
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      this.connected = true;
      this.emit('connected', { adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.emit('error', { error, adapter: this.name });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await fetch('/api/database/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'postgresql' })
      });

      this.connected = false;
      this.emit('disconnected', { adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('PostgreSQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/database/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'postgresql',
          data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      this.lastSync = new Date();
      this.emit('sync-completed', { data, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.emit('sync-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async backup(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('PostgreSQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'postgresql',
          data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
      }

      this.lastBackup = new Date();
      this.emit('backup-completed', { data, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.emit('backup-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('PostgreSQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'postgresql' })
      });

      if (!response.ok) {
        throw new Error(`Restore failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.emit('restore-completed', { data, adapter: this.name });
      return data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.emit('restore-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('PostgreSQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/database/sync-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'postgresql',
          storeName,
          data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Store sync failed: ${response.statusText}`);
      }

      this.emit('store-sync-completed', { storeName, data, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.emit('store-sync-failed', { storeName, error, adapter: this.name });
      throw error;
    }
  }

  async restoreStore(storeName: string): Promise<any> {
    if (!this.connected) {
      throw new Error('PostgreSQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/database/restore-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'postgresql',
          storeName
        })
      });

      if (!response.ok) {
        throw new Error(`Store restore failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.emit('store-restore-completed', { storeName, data, adapter: this.name });
      return data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.emit('store-restore-failed', { storeName, error, adapter: this.name });
      throw error;
    }
  }

  // Custom PostgreSQL methods
  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connected) {
      throw new Error('PostgreSQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'postgresql',
          sql,
          params
        })
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  async findAll(options: PostgreSQLQueryOptions): Promise<any[]> {
    const { table, where, orderBy, limit, offset } = options;
    let sql = `SELECT * FROM ${this.config.schema ? `${this.config.schema}.` : ''}${table}`;
    const params: any[] = [];

    if (where) {
      const whereClause = Object.keys(where).map((key, index) => {
        params.push(where[key]);
        return `${key} = $${index + 1}`;
      }).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
      params.push(limit);
      sql += ` LIMIT $${params.length}`;
    }

    if (offset) {
      params.push(offset);
      sql += ` OFFSET $${params.length}`;
    }

    return await this.query(sql, params);
  }

  async create(table: string, data: Record<string, any>): Promise<any> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `
      INSERT INTO ${this.config.schema ? `${this.config.schema}.` : ''}${table} 
      (${columns.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;

    const result = await this.query(sql, values);
    return result[0];
  }

  async update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<any> {
    const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereClause = Object.keys(where).map((key, index) => {
      return `${key} = $${Object.keys(data).length + index + 1}`;
    }).join(' AND ');

    const sql = `
      UPDATE ${this.config.schema ? `${this.config.schema}.` : ''}${table} 
      SET ${setClause} 
      WHERE ${whereClause} 
      RETURNING *
    `;

    const params = [...Object.values(data), ...Object.values(where)];
    const result = await this.query(sql, params);
    return result[0];
  }

  async delete(table: string, where: Record<string, any>): Promise<boolean> {
    const whereClause = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const sql = `DELETE FROM ${this.config.schema ? `${this.config.schema}.` : ''}${table} WHERE ${whereClause}`;
    
    await this.query(sql, Object.values(where));
    return true;
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
      supportsRealTime: false, // WebSocket support will be added separately
      supportedFormats: ['json', 'sql']
    };
  }

  private sanitizeConfig() {
    // Remove sensitive information when sending to backend
    const { password, ...safeConfig } = this.config;
    return {
      ...safeConfig,
      hasPassword: !!password
    };
  }
}
