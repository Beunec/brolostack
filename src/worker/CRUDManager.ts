/**
 * CRUD Manager for Brolostack Worker
 * Handles all database operations across multiple providers with optimistic updates,
 * conflict resolution, and intelligent caching
 */

import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';

export interface DatabaseConfig {
  providers: Array<{
    name: string;
    type: 'sql' | 'nosql' | 'graph' | 'cache' | 'search';
    config: any;
    priority: number;
    enabled: boolean;
    capabilities: string[];
    regions?: string[];
  }>;
  defaultProvider: string;
  sharding: {
    enabled: boolean;
    strategy: 'range' | 'hash' | 'directory' | 'consistent-hash';
    shardKey: string;
    shardCount: number;
  };
  replication: {
    enabled: boolean;
    factor: number;
    consistency: 'eventual' | 'strong' | 'bounded' | 'causal';
    readPreference: 'primary' | 'secondary' | 'nearest';
  };
  caching: {
    enabled: boolean;
    provider: string;
    ttl: number;
    maxSize: number;
    evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
  };
  conflictResolution: {
    strategy: 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual' | 'vector-clock';
    mergeFunction?: string;
    vectorClockEnabled: boolean;
  };
}

export interface CRUDOperation {
  id: string;
  type: 'create' | 'read' | 'update' | 'delete' | 'batch';
  provider: string;
  collection: string;
  data?: any;
  filter?: any;
  options?: {
    upsert?: boolean;
    multi?: boolean;
    sort?: any;
    limit?: number;
    skip?: number;
    projection?: any;
    transaction?: boolean;
    timeout?: number;
  };
  metadata: {
    userId: string;
    sessionId: string;
    timestamp: number;
    version?: number;
    vectorClock?: Record<string, number>;
    optimistic?: boolean;
  };
}

export interface CRUDResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
    retryAfter?: number;
  };
  metadata: {
    provider: string;
    executionTime: number;
    cacheHit: boolean;
    conflictDetected: boolean;
    replicationStatus?: 'pending' | 'completed' | 'failed';
    consistencyLevel: string;
  };
}

export interface ConflictResolution {
  conflictId: string;
  operation: CRUDOperation;
  localVersion: any;
  remoteVersion: any;
  resolution: 'local' | 'remote' | 'merged' | 'manual';
  mergedData?: any;
  timestamp: Date;
  resolvedBy: string;
}

export interface OptimisticUpdate {
  id: string;
  operation: CRUDOperation;
  localData: any;
  applied: boolean;
  confirmed: boolean;
  rollbackData?: any;
  timestamp: Date;
  ttl: number;
}

export class CRUDManager extends EventEmitter {
  private config: DatabaseConfig;
  private logger: Logger;
  private providers: Map<string, any> = new Map();
  private cache: Map<string, any> = new Map();
  private optimisticUpdates: Map<string, OptimisticUpdate> = new Map();
  private conflictQueue: ConflictResolution[] = [];
  private operationHistory: Map<string, CRUDOperation[]> = new Map();
  private performanceMetrics: {
    operationsPerSecond: number;
    averageLatency: number;
    cacheHitRate: number;
    conflictRate: number;
    errorRate: number;
  };

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
    this.logger = new Logger(false, 'CRUDManager');
    this.performanceMetrics = {
      operationsPerSecond: 0,
      averageLatency: 0,
      cacheHitRate: 0,
      conflictRate: 0,
      errorRate: 0
    };
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing CRUD Manager...');

      // Initialize database providers
      for (const providerConfig of this.config.providers) {
        if (providerConfig.enabled) {
          await this.initializeProvider(providerConfig);
        }
      }

      // Initialize caching if enabled
      if (this.config.caching.enabled) {
        await this.initializeCache();
      }

      // Start conflict resolution processor
      this.startConflictResolutionProcessor();

      // Start optimistic update cleanup
      this.startOptimisticUpdateCleanup();

      // Start performance monitoring
      this.startPerformanceMonitoring();

      this.emit('crud-manager-initialized');
      this.logger.info('CRUD Manager initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize CRUD Manager:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Process remaining optimistic updates
      await this.processRemainingOptimisticUpdates();

      // Resolve remaining conflicts
      await this.resolveRemainingConflicts();

      // Disconnect from providers
      for (const [name, provider] of this.providers) {
        try {
          if (provider.disconnect) {
            await provider.disconnect();
          }
        } catch (error) {
          this.logger.warn(`Failed to disconnect provider ${name}:`, error);
        }
      }

      this.emit('crud-manager-shutdown');
      this.logger.info('CRUD Manager shut down successfully');

    } catch (error) {
      this.logger.error('Error during CRUD Manager shutdown:', error);
      throw error;
    }
  }

  // Main CRUD Operations
  async executeOperation(operation: CRUDOperation): Promise<CRUDResult> {
    const startTime = Date.now();
    
    try {
      // Validate operation
      this.validateOperation(operation);

      // Check cache first for read operations
      if (operation.type === 'read' && this.config.caching.enabled) {
        const cached = await this.getCachedResult(operation);
        if (cached) {
          return {
            success: true,
            data: cached,
            metadata: {
              provider: 'cache',
              executionTime: Date.now() - startTime,
              cacheHit: true,
              conflictDetected: false,
              consistencyLevel: 'cached'
            }
          };
        }
      }

      // Apply optimistic update for UI responsiveness
      if (operation.metadata.optimistic && ['create', 'update', 'delete'].includes(operation.type)) {
        await this.applyOptimisticUpdate(operation);
      }

      // Select optimal provider
      const provider = await this.selectProvider(operation);

      // Execute operation
      const result = await this.executeOnProvider(provider, operation);

      // Handle replication if enabled
      if (this.config.replication.enabled && ['create', 'update', 'delete'].includes(operation.type)) {
        await this.replicateOperation(operation, result, provider);
      }

      // Update cache
      if (this.config.caching.enabled && result.success) {
        await this.updateCache(operation, result.data);
      }

      // Confirm optimistic update
      if (operation.metadata.optimistic) {
        await this.confirmOptimisticUpdate(operation.id, result);
      }

      // Update performance metrics
      this.updatePerformanceMetrics(operation, result, Date.now() - startTime);

      // Log operation
      this.logOperation(operation, result);

      return result;

    } catch (error) {
      this.logger.error('CRUD operation failed:', error);

      // Rollback optimistic update if needed
      if (operation.metadata.optimistic) {
        await this.rollbackOptimisticUpdate(operation.id);
      }

      const result: CRUDResult = {
        success: false,
        error: {
          code: 'CRUD_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          recoverable: this.isRecoverableError(error)
        },
        metadata: {
          provider: operation.provider,
          executionTime: Date.now() - startTime,
          cacheHit: false,
          conflictDetected: false,
          consistencyLevel: 'error'
        }
      };

      this.updatePerformanceMetrics(operation, result, Date.now() - startTime);
      return result;
    }
  }

  // Batch Operations
  async executeBatchOperation(operations: CRUDOperation[]): Promise<CRUDResult[]> {
    const results: CRUDResult[] = [];
    const transactions: Map<string, CRUDOperation[]> = new Map();

    // Group operations by provider for transaction support
    operations.forEach(op => {
      if (!transactions.has(op.provider)) {
        transactions.set(op.provider, []);
      }
      transactions.get(op.provider)!.push(op);
    });

    // Execute transactions per provider
    for (const [providerName, providerOps] of transactions) {
      try {
        const provider = this.providers.get(providerName);
        if (!provider) {
          throw new Error(`Provider ${providerName} not found`);
        }

        // Start transaction if supported
        let transactionId: string | null = null;
        if (provider.beginTransaction) {
          transactionId = await provider.beginTransaction();
        }

        try {
          // Execute operations in transaction
          for (const operation of providerOps) {
            const result = await this.executeOperation(operation);
            results.push(result);

            if (!result.success && transactionId) {
              throw new Error(`Operation ${operation.id} failed in transaction`);
            }
          }

          // Commit transaction
          if (transactionId) {
            await provider.commitTransaction(transactionId);
          }

        } catch (error) {
          // Rollback transaction
          if (transactionId) {
            await provider.rollbackTransaction(transactionId);
          }
          throw error;
        }

      } catch (error) {
        this.logger.error(`Batch operation failed for provider ${providerName}:`, error);
        
        // Add error results for remaining operations
        providerOps.forEach(_op => {
          results.push({
            success: false,
        error: {
          code: 'BATCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          recoverable: false
        },
            metadata: {
              provider: providerName,
              executionTime: 0,
              cacheHit: false,
              conflictDetected: false,
              consistencyLevel: 'error'
            }
          });
        });
      }
    }

    this.emit('batch-operation-completed', { operations, results });
    return results;
  }

  // Real-time Sync Operations
  async syncData(storeName: string, localData: any, providers?: string[]): Promise<{
    conflicts: ConflictResolution[];
    syncResults: Record<string, CRUDResult>;
    finalData: any;
  }> {
    const targetProviders = providers || [this.config.defaultProvider];
    const conflicts: ConflictResolution[] = [];
    const syncResults: Record<string, CRUDResult> = {};
    let finalData = localData;

    for (const providerName of targetProviders) {
      try {
        const provider = this.providers.get(providerName);
        if (!provider) {
          continue;
        }

        // Get remote data
        const remoteData = await this.executeOnProvider(provider, {
          id: `sync_read_${Date.now()}`,
          type: 'read',
          provider: providerName,
          collection: storeName,
          filter: {},
          metadata: {
            userId: 'system',
            sessionId: 'sync',
            timestamp: Date.now()
          }
        });

        if (remoteData.success && remoteData.data) {
          // Check for conflicts
          const conflict = await this.detectConflict(localData, remoteData.data, storeName);
          
          if (conflict) {
            const resolution = await this.resolveConflict(conflict, localData, remoteData.data);
            conflicts.push(resolution);
            
            if (resolution.resolution === 'merged') {
              finalData = resolution.mergedData;
            } else if (resolution.resolution === 'remote') {
              finalData = remoteData.data;
            }
          }
        }

        // Sync final data to provider
        const syncResult = await this.executeOnProvider(provider, {
          id: `sync_write_${Date.now()}`,
          type: 'update',
          provider: providerName,
          collection: storeName,
          data: finalData,
          filter: {},
          options: { upsert: true },
          metadata: {
            userId: 'system',
            sessionId: 'sync',
            timestamp: Date.now()
          }
        });

        syncResults[providerName] = syncResult;

      } catch (error) {
        this.logger.error(`Sync failed for provider ${providerName}:`, error);
        syncResults[providerName] = {
          success: false,
          error: {
            code: 'SYNC_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: true
          },
          metadata: {
            provider: providerName,
            executionTime: 0,
            cacheHit: false,
            conflictDetected: false,
            consistencyLevel: 'error'
          }
        };
      }
    }

    this.emit('sync-completed', { storeName, conflicts, syncResults, finalData });
    return { conflicts, syncResults, finalData };
  }

  // Optimistic Updates
  async applyOptimisticUpdate(operation: CRUDOperation): Promise<void> {
    const optimisticUpdate: OptimisticUpdate = {
      id: operation.id,
      operation,
      localData: operation.data,
      applied: false,
      confirmed: false,
      timestamp: new Date(),
      ttl: 30000 // 30 seconds TTL
    };

    // Apply update locally first
    try {
      await this.applyLocalUpdate(operation);
      optimisticUpdate.applied = true;
      
      this.optimisticUpdates.set(operation.id, optimisticUpdate);
      this.emit('optimistic-update-applied', { operation, update: optimisticUpdate });
      
    } catch (error) {
      this.logger.error('Failed to apply optimistic update:', error);
      throw error;
    }
  }

  async confirmOptimisticUpdate(operationId: string, result: CRUDResult): Promise<void> {
    const update = this.optimisticUpdates.get(operationId);
    if (!update) {
      return;
    }

    if (result.success) {
      update.confirmed = true;
      this.emit('optimistic-update-confirmed', { operationId, result });
    } else {
      await this.rollbackOptimisticUpdate(operationId);
    }

    this.optimisticUpdates.delete(operationId);
  }

  async rollbackOptimisticUpdate(operationId: string): Promise<void> {
    const update = this.optimisticUpdates.get(operationId);
    if (!update || !update.applied) {
      return;
    }

    try {
      // Apply rollback operation
      if (update.rollbackData) {
        await this.applyLocalUpdate({
          ...update.operation,
          data: update.rollbackData,
          type: update.operation.type === 'create' ? 'delete' : 'update'
        });
      }

      this.emit('optimistic-update-rolled-back', { operationId, update });
      this.optimisticUpdates.delete(operationId);

    } catch (error) {
      this.logger.error('Failed to rollback optimistic update:', error);
    }
  }

  // Conflict Detection and Resolution
  async detectConflict(localData: any, remoteData: any, _resource: string): Promise<ConflictResolution | null> {
    if (!localData || !remoteData) {
      return null;
    }

    // Simple timestamp-based conflict detection
    const localTimestamp = localData.updatedAt || localData.timestamp || 0;
    const remoteTimestamp = remoteData.updatedAt || remoteData.timestamp || 0;

    if (Math.abs(localTimestamp - remoteTimestamp) < 1000) {
      return null; // No significant time difference
    }

    // Vector clock conflict detection if enabled
    if (this.config.conflictResolution.vectorClockEnabled) {
      const localClock = localData.vectorClock || {};
      const remoteClock = remoteData.vectorClock || {};
      
      if (this.compareVectorClocks(localClock, remoteClock) === 'concurrent') {
        return {
          conflictId: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          operation: {} as CRUDOperation, // Would be filled with actual operation
          localVersion: localData,
          remoteVersion: remoteData,
          resolution: 'manual',
          timestamp: new Date(),
          resolvedBy: 'system'
        };
      }
    }

    // Deep object comparison for conflict detection
    const differences = this.deepCompare(localData, remoteData);
    if (differences.length > 0) {
      return {
        conflictId: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation: {} as CRUDOperation,
        localVersion: localData,
        remoteVersion: remoteData,
        resolution: 'manual',
        timestamp: new Date(),
        resolvedBy: 'system'
      };
    }

    return null;
  }

  async resolveConflict(conflict: ConflictResolution, localData: any, remoteData: any): Promise<ConflictResolution> {
    try {
      switch (this.config.conflictResolution.strategy) {
        case 'last-write-wins':
          const localTime = localData.updatedAt || localData.timestamp || 0;
          const remoteTime = remoteData.updatedAt || remoteData.timestamp || 0;
          
          if (remoteTime > localTime) {
            conflict.resolution = 'remote';
            conflict.mergedData = remoteData;
          } else {
            conflict.resolution = 'local';
            conflict.mergedData = localData;
          }
          break;

        case 'first-write-wins':
          const localCreated = localData.createdAt || localData.timestamp || 0;
          const remoteCreated = remoteData.createdAt || remoteData.timestamp || 0;
          
          if (remoteCreated < localCreated) {
            conflict.resolution = 'remote';
            conflict.mergedData = remoteData;
          } else {
            conflict.resolution = 'local';
            conflict.mergedData = localData;
          }
          break;

        case 'merge':
          conflict.resolution = 'merged';
          conflict.mergedData = await this.mergeData(localData, remoteData);
          break;

        case 'vector-clock':
          const clockComparison = this.compareVectorClocks(
            localData.vectorClock || {},
            remoteData.vectorClock || {}
          );
          
          if (clockComparison === 'local') {
            conflict.resolution = 'local';
            conflict.mergedData = localData;
          } else if (clockComparison === 'remote') {
            conflict.resolution = 'remote';
            conflict.mergedData = remoteData;
          } else {
            conflict.resolution = 'merged';
            conflict.mergedData = await this.mergeData(localData, remoteData);
          }
          break;

        default:
          conflict.resolution = 'manual';
          this.conflictQueue.push(conflict);
          return conflict;
      }

      conflict.resolvedBy = 'auto';
      this.emit('conflict-resolved', conflict);
      return conflict;

    } catch (error) {
      this.logger.error('Conflict resolution failed:', error);
      conflict.resolution = 'manual';
      this.conflictQueue.push(conflict);
      return conflict;
    }
  }

  // Provider Management
  private async initializeProvider(providerConfig: any): Promise<void> {
    try {
      let provider;

      switch (providerConfig.type) {
        case 'sql':
          const { SQLAdapter } = await import('../cloud/adapters/SQLAdapter');
          provider = new SQLAdapter(providerConfig.config);
          break;
        case 'nosql':
          const { NoSQLAdapter } = await import('../cloud/adapters/NoSQLAdapter');
          provider = new NoSQLAdapter(providerConfig.config);
          break;
        case 'cache':
          const { RedisCloudAdapter } = await import('../cloud/providers/RedisCloudAdapter');
          provider = new RedisCloudAdapter(providerConfig.config);
          break;
        default:
          throw new Error(`Unsupported provider type: ${providerConfig.type}`);
      }

      await provider.connect();
      this.providers.set(providerConfig.name, provider);
      
      this.logger.info(`Provider ${providerConfig.name} (${providerConfig.type}) initialized`);

    } catch (error) {
      this.logger.error(`Failed to initialize provider ${providerConfig.name}:`, error);
      throw error;
    }
  }

  private async selectProvider(operation: CRUDOperation): Promise<any> {
    // Use specified provider if available
    if (operation.provider && this.providers.has(operation.provider)) {
      return this.providers.get(operation.provider);
    }

    // Select based on operation type and data characteristics
    const candidates = Array.from(this.providers.entries())
      .filter(([_name, provider]) => this.isProviderSuitable(provider, operation))
      .sort((a, b) => this.getProviderScore(b[1], operation) - this.getProviderScore(a[1], operation));

    if (candidates.length === 0) {
      throw new Error('No suitable provider found for operation');
    }

    return candidates[0]?.[1] || this.providers.get(this.config.defaultProvider);
  }

  private isProviderSuitable(provider: any, operation: CRUDOperation): boolean {
    // Check if provider supports the operation type
    const capabilities = provider.getCapabilities ? provider.getCapabilities() : {};
    
    switch (operation.type) {
      case 'read':
        return true; // All providers support read
      case 'create':
      case 'update':
      case 'delete':
        return capabilities.supportsWrite !== false;
      default:
        return false;
    }
  }

  private getProviderScore(provider: any, operation: CRUDOperation): number {
    let score = 0;

    // Base score from provider configuration
    const config = this.config.providers.find(p => p.name === provider.name);
    if (config) {
      score += config.priority;
    }

    // Performance-based scoring
    const stats = this.getProviderStats(provider.name);
    if (stats) {
      score += (100 - stats.averageLatency) / 10; // Lower latency = higher score
      score += stats.successRate; // Higher success rate = higher score
    }

    // Operation type preferences
    if (operation.type === 'read' && provider.type === 'cache') {
      score += 10; // Prefer cache for reads
    }

    if (['create', 'update', 'delete'].includes(operation.type) && provider.type === 'sql') {
      score += 5; // Prefer SQL for writes (ACID properties)
    }

    return score;
  }

  private async executeOnProvider(provider: any, operation: CRUDOperation): Promise<CRUDResult> {
    const startTime = Date.now();

    try {
      let result;

      switch (operation.type) {
        case 'create':
          if (provider.create) {
            result = await provider.create(operation.collection, operation.data);
          } else if (provider.insert) {
            result = await provider.insert(operation.collection, operation.data);
          } else {
            throw new Error('Provider does not support create operation');
          }
          break;

        case 'read':
          if (provider.read) {
            result = await provider.read(operation.collection, operation.filter, operation.options);
          } else if (provider.find) {
            result = await provider.find(operation.collection, operation.filter, operation.options);
          } else {
            throw new Error('Provider does not support read operation');
          }
          break;

        case 'update':
          if (provider.update) {
            result = await provider.update(operation.collection, operation.filter, operation.data, operation.options);
          } else {
            throw new Error('Provider does not support update operation');
          }
          break;

        case 'delete':
          if (provider.delete) {
            result = await provider.delete(operation.collection, operation.filter, operation.options);
          } else {
            throw new Error('Provider does not support delete operation');
          }
          break;

        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }

      return {
        success: true,
        data: result,
        metadata: {
          provider: provider.name || 'unknown',
          executionTime: Date.now() - startTime,
          cacheHit: false,
          conflictDetected: false,
          consistencyLevel: this.config.replication.consistency
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          recoverable: this.isRecoverableError(error)
        },
        metadata: {
          provider: provider.name || 'unknown',
          executionTime: Date.now() - startTime,
          cacheHit: false,
          conflictDetected: false,
          consistencyLevel: 'error'
        }
      };
    }
  }

  // Caching Operations
  private async initializeCache(): Promise<void> {
    const cacheProvider = this.providers.get(this.config.caching.provider);
    if (!cacheProvider) {
      this.logger.warn(`Cache provider ${this.config.caching.provider} not found`);
      return;
    }

    this.logger.info('Cache initialized');
  }

  private async getCachedResult(operation: CRUDOperation): Promise<any> {
    const cacheKey = this.generateCacheKey(operation);
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.config.caching.ttl) {
      this.emit('cache-hit', { operation, cacheKey });
      return cached.data;
    }

    this.emit('cache-miss', { operation, cacheKey });
    return null;
  }

  private async updateCache(operation: CRUDOperation, data: any): Promise<void> {
    if (operation.type !== 'read') {
      return; // Only cache read operations
    }

    const cacheKey = this.generateCacheKey(operation);
    
    // Check cache size limit
    if (this.cache.size >= this.config.caching.maxSize) {
      await this.evictCacheEntries();
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      operation
    });

    this.emit('cache-updated', { cacheKey, operation });
  }

  private generateCacheKey(operation: CRUDOperation): string {
    const keyData = {
      provider: operation.provider,
      collection: operation.collection,
      filter: operation.filter,
      options: operation.options
    };

    return `cache_${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private async evictCacheEntries(): Promise<void> {
    const entries = Array.from(this.cache.entries());
    
    switch (this.config.caching.evictionPolicy) {
      case 'LRU':
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case 'LFU':
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'FIFO':
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case 'TTL':
        entries.sort((a, b) => (Date.now() - a[1].timestamp) - (Date.now() - b[1].timestamp));
        break;
    }

    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const entry = entries[i];
      if (entry) {
        this.cache.delete(entry[0]);
      }
    }

    this.emit('cache-evicted', { removedCount: toRemove });
  }

  // Data Operations
  private async applyLocalUpdate(operation: CRUDOperation): Promise<void> {
    // Apply update to local storage (IndexedDB, localStorage, etc.)
    // This would integrate with Brolostack's storage layer
    this.emit('local-update-applied', { operation });
  }

  private async mergeData(localData: any, remoteData: any): Promise<any> {
    // Intelligent data merging
    const merged = { ...remoteData };

    // Merge non-conflicting fields
    Object.keys(localData).forEach(key => {
      if (!(key in remoteData)) {
        merged[key] = localData[key];
      } else if (typeof localData[key] === 'object' && typeof remoteData[key] === 'object') {
        merged[key] = this.mergeObjects(localData[key], remoteData[key]);
      }
    });

    // Update metadata
    merged.mergedAt = new Date().toISOString();
    merged.mergeStrategy = this.config.conflictResolution.strategy;

    return merged;
  }

  private mergeObjects(local: any, remote: any): any {
    const merged = { ...remote };
    
    Object.keys(local).forEach(key => {
      if (!(key in remote)) {
        merged[key] = local[key];
      } else if (Array.isArray(local[key]) && Array.isArray(remote[key])) {
        // Merge arrays by removing duplicates
        merged[key] = [...new Set([...remote[key], ...local[key]])];
      }
    });

    return merged;
  }

  private compareVectorClocks(local: Record<string, number>, remote: Record<string, number>): 'local' | 'remote' | 'concurrent' {
    const allNodes = new Set([...Object.keys(local), ...Object.keys(remote)]);
    let localNewer = false;
    let remoteNewer = false;

    for (const node of allNodes) {
      const localValue = local[node] || 0;
      const remoteValue = remote[node] || 0;

      if (localValue > remoteValue) {
        localNewer = true;
      } else if (remoteValue > localValue) {
        remoteNewer = true;
      }
    }

    if (localNewer && !remoteNewer) return 'local';
    if (remoteNewer && !localNewer) return 'remote';
    return 'concurrent';
  }

  private deepCompare(obj1: any, obj2: any): string[] {
    const differences: string[] = [];
    
    const compare = (o1: any, o2: any, path = ''): void => {
      if (typeof o1 !== typeof o2) {
        differences.push(`${path}: type mismatch`);
        return;
      }

      if (typeof o1 === 'object' && o1 !== null) {
        const keys = new Set([...Object.keys(o1), ...Object.keys(o2)]);
        
        for (const key of keys) {
          const newPath = path ? `${path}.${key}` : key;
          
          if (!(key in o1)) {
            differences.push(`${newPath}: missing in local`);
          } else if (!(key in o2)) {
            differences.push(`${newPath}: missing in remote`);
          } else {
            compare(o1[key], o2[key], newPath);
          }
        }
      } else if (o1 !== o2) {
        differences.push(`${path}: value mismatch`);
      }
    };

    compare(obj1, obj2);
    return differences;
  }

  // Utility Methods
  private validateOperation(operation: CRUDOperation): void {
    if (!operation.id) {
      throw new Error('Operation ID is required');
    }

    if (!operation.type) {
      throw new Error('Operation type is required');
    }

    if (!operation.collection) {
      throw new Error('Collection name is required');
    }

    if (['create', 'update'].includes(operation.type) && !operation.data) {
      throw new Error('Data is required for create/update operations');
    }

    if (['update', 'delete'].includes(operation.type) && !operation.filter) {
      throw new Error('Filter is required for update/delete operations');
    }
  }

  private isRecoverableError(error: any): boolean {
    const recoverableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'RATE_LIMITED',
      'TEMPORARY_UNAVAILABLE',
      'CONNECTION_LOST'
    ];

    return recoverableErrors.some(code => 
      error.message.includes(code) || error.code === code
    );
  }

  private async replicateOperation(operation: CRUDOperation, _result: CRUDResult, primaryProvider: any): Promise<void> {
    if (!this.config.replication.enabled) {
      return;
    }

    const replicationProviders = Array.from(this.providers.values())
      .filter(p => p !== primaryProvider)
      .slice(0, this.config.replication.factor - 1);

    const replicationPromises = replicationProviders.map(async (provider) => {
      try {
        await this.executeOnProvider(provider, {
          ...operation,
          id: `repl_${operation.id}_${provider.name}`
        });
        
        this.emit('replication-success', { operation, provider: provider.name });
      } catch (error) {
        this.emit('replication-failed', { operation, provider: provider.name, error });
        this.logger.warn(`Replication failed for provider ${provider.name}:`, error);
      }
    });

    // Don't wait for replication to complete for eventual consistency
    if (this.config.replication.consistency === 'eventual') {
      Promise.all(replicationPromises);
    } else {
      await Promise.all(replicationPromises);
    }
  }

  private startConflictResolutionProcessor(): void {
    setInterval(() => {
      this.processConflictQueue();
    }, 5000); // Process conflicts every 5 seconds
  }

  private async processConflictQueue(): Promise<void> {
    while (this.conflictQueue.length > 0) {
      const conflict = this.conflictQueue.shift()!;
      
      try {
        // Attempt automatic resolution
        const resolved = await this.resolveConflict(conflict, conflict.localVersion, conflict.remoteVersion);
        
        if (resolved.resolution !== 'manual') {
          this.emit('conflict-auto-resolved', resolved);
        } else {
          // Emit for manual resolution
          this.emit('conflict-requires-manual-resolution', resolved);
        }
      } catch (error) {
        this.logger.error('Conflict processing failed:', error);
      }
    }
  }

  private startOptimisticUpdateCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredOptimisticUpdates();
    }, 10000); // Cleanup every 10 seconds
  }

  private cleanupExpiredOptimisticUpdates(): void {
    const now = Date.now();
    
    for (const [id, update] of this.optimisticUpdates) {
      if (now - update.timestamp.getTime() > update.ttl) {
        if (!update.confirmed) {
          this.rollbackOptimisticUpdate(id);
        } else {
          this.optimisticUpdates.delete(id);
        }
      }
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.calculatePerformanceMetrics();
    }, 60000); // Update metrics every minute
  }

  private calculatePerformanceMetrics(): void {
    // Calculate metrics based on operation history
    // This is a simplified implementation
    // Update metrics timestamp
    this.emit('performance-metrics-updated', this.performanceMetrics);
  }

  private updatePerformanceMetrics(_operation: CRUDOperation, _result: CRUDResult, _executionTime: number): void {
    // Update running performance metrics
    // This would be more sophisticated in a real implementation
  }

  private logOperation(operation: CRUDOperation, _result: CRUDResult): void {
    const history = this.operationHistory.get(operation.collection) || [];
    history.push(operation);
    
    // Keep only last 1000 operations per collection
    if (history.length > 1000) {
      history.shift();
    }
    
    this.operationHistory.set(operation.collection, history);
  }

  private getProviderStats(_providerName: string): any {
    // Return provider performance statistics
    return {
      averageLatency: 100,
      successRate: 95,
      errorCount: 5
    };
  }

  private async processRemainingOptimisticUpdates(): Promise<void> {
    for (const [id, update] of this.optimisticUpdates) {
      if (!update.confirmed) {
        await this.rollbackOptimisticUpdate(id);
      }
    }
  }

  private async resolveRemainingConflicts(): Promise<void> {
    while (this.conflictQueue.length > 0) {
      const conflict = this.conflictQueue.shift()!;
      // Force resolution using default strategy
      conflict.resolution = 'remote'; // Safe default
      this.emit('conflict-force-resolved', conflict);
    }
  }

  // Public Utility Methods
  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getOperationHistory(collection?: string): CRUDOperation[] {
    if (collection) {
      return this.operationHistory.get(collection) || [];
    }
    
    return Array.from(this.operationHistory.values()).flat();
  }

  getOptimisticUpdates(): OptimisticUpdate[] {
    return Array.from(this.optimisticUpdates.values());
  }

  getConflictQueue(): ConflictResolution[] {
    return [...this.conflictQueue];
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  getCacheStats(): {
    size: number;
    hitRate: number;
    maxSize: number;
    evictionPolicy: string;
  } {
    return {
      size: this.cache.size,
      hitRate: this.performanceMetrics.cacheHitRate,
      maxSize: this.config.caching.maxSize,
      evictionPolicy: this.config.caching.evictionPolicy
    };
  }

  getAIProviderStats(): any {
    return {
      totalProviders: this.providers.size,
      activeProviders: Array.from(this.providers.keys())
    };
  }

  getCloudProviderStats(): any {
    return {
      totalProviders: this.providers.size,
      activeProviders: Array.from(this.providers.keys())
    };
  }
}
