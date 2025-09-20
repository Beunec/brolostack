/**
 * MongoDB Atlas Adapter for Brolostack
 * Enterprise-grade MongoDB Atlas integration for document storage and analytics
 */

import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface MongoDBAtlasConfig {
  connectionString: string;
  databaseName: string;
  collectionPrefix?: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    connectTimeoutMS?: number;
    retryWrites?: boolean;
    retryReads?: boolean;
    readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
    writeConcern?: {
      w?: number | 'majority';
      j?: boolean;
      wtimeout?: number;
    };
  };
  atlas?: {
    projectId: string;
    clusterName: string;
    apiKey?: string;
    privateKey?: string;
  };
  search?: {
    enabled: boolean;
    indexName?: string;
  };
  analytics?: {
    enabled: boolean;
    pipelineTimeout?: number;
  };
}

export interface MongoDBQuery {
  collection: string;
  operation: 'find' | 'findOne' | 'insertOne' | 'insertMany' | 'updateOne' | 'updateMany' | 'deleteOne' | 'deleteMany' | 'aggregate';
  filter?: Record<string, any>;
  document?: any;
  documents?: any[];
  update?: Record<string, any>;
  options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
    projection?: Record<string, any>;
    upsert?: boolean;
  };
  pipeline?: any[]; // For aggregation
}

export interface MongoDBSearchQuery {
  index: string;
  text?: {
    query: string;
    path: string | string[];
    fuzzy?: {
      maxEdits: number;
      prefixLength?: number;
      maxExpansions?: number;
    };
  };
  compound?: {
    must?: any[];
    mustNot?: any[];
    should?: any[];
    filter?: any[];
  };
  highlight?: {
    path: string | string[];
    maxCharsToExamine?: number;
    maxNumPassages?: number;
  };
  limit?: number;
  skip?: number;
}

export class MongoDBAtlasAdapter extends EventEmitter implements CloudAdapter {
  public readonly name = 'mongodb-atlas';
  public readonly provider = 'MongoDB Atlas';
  
  private config: MongoDBAtlasConfig;
  private connected = false;
  private errorCount = 0;
  private lastError?: string;
  private lastSync?: Date;
  private lastBackup?: Date;
  private logger: Logger;

  constructor(config: MongoDBAtlasConfig) {
    super();
    this.config = {
      collectionPrefix: 'brolostack_',
      options: {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
        readPreference: 'primaryPreferred'
      },
      ...config
    };
    this.logger = new Logger(false, 'MongoDBAtlasAdapter');
  }

  async connect(): Promise<void> {
    try {
      // Test connection with a simple ping
      await this.executeQuery({
        collection: 'test',
        operation: 'findOne',
        filter: { _id: 'connection_test' }
      });
      
      this.connected = true;
      this.emit('connected', { adapter: this.name });
      this.logger.info('Connected to MongoDB Atlas');
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      this.emit('error', { error, adapter: this.name });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: this.name });
    this.logger.info('Disconnected from MongoDB Atlas');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('MongoDB Atlas adapter is not connected');
    }

    try {
      const collection = `${this.config.collectionPrefix}sync`;
      
      await this.executeQuery({
        collection,
        operation: 'insertOne',
        document: {
          data,
          timestamp: new Date(),
          checksum: this.generateChecksum(data),
          type: 'sync'
        }
      });
      
      // Keep only the latest sync record
      await this.executeQuery({
        collection,
        operation: 'deleteMany',
        filter: {
          type: 'sync',
          timestamp: { $lt: new Date(Date.now() - 86400000) } // Older than 24 hours
        }
      });
      
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
      throw new Error('MongoDB Atlas adapter is not connected');
    }

    try {
      const collection = `${this.config.collectionPrefix}backups`;
      
      const backupDoc = {
        data,
        timestamp: new Date(),
        checksum: this.generateChecksum(data),
        size: JSON.stringify(data).length,
        type: 'backup',
        id: `backup_${Date.now()}`
      };
      
      await this.executeQuery({
        collection,
        operation: 'insertOne',
        document: backupDoc
      });
      
      // Keep only last 100 backups
      const backupCount = await this.countDocuments(collection, { type: 'backup' });
      if (backupCount > 100) {
        const oldestBackups = await this.executeQuery({
          collection,
          operation: 'find',
          filter: { type: 'backup' },
          options: {
            sort: { timestamp: 1 },
            limit: backupCount - 100,
            projection: { _id: 1 }
          }
        });
        
        const idsToDelete = oldestBackups.map((doc: any) => doc._id);
        await this.executeQuery({
          collection,
          operation: 'deleteMany',
          filter: { _id: { $in: idsToDelete } }
        });
      }
      
      this.lastBackup = new Date();
      this.emit('backup-completed', { data, backupId: backupDoc.id, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      this.emit('backup-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('MongoDB Atlas adapter is not connected');
    }

    try {
      const collection = `${this.config.collectionPrefix}sync`;
      
      const latestSync = await this.executeQuery({
        collection,
        operation: 'findOne',
        filter: { type: 'sync' },
        options: {
          sort: { timestamp: -1 }
        }
      });
      
      if (!latestSync) {
        throw new Error('No sync data found');
      }
      
      this.emit('restore-completed', { data: latestSync.data, adapter: this.name });
      return latestSync.data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      this.emit('restore-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('MongoDB Atlas adapter is not connected');
    }

    try {
      const collection = `${this.config.collectionPrefix}stores`;
      
      await this.executeQuery({
        collection,
        operation: 'updateOne',
        filter: { storeName },
        update: {
          $set: {
            data,
            timestamp: new Date(),
            checksum: this.generateChecksum(data)
          }
        },
        options: { upsert: true }
      });
      
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
      throw new Error('MongoDB Atlas adapter is not connected');
    }

    try {
      const collection = `${this.config.collectionPrefix}stores`;
      
      const storeDoc = await this.executeQuery({
        collection,
        operation: 'findOne',
        filter: { storeName }
      });
      
      if (!storeDoc) {
        return null;
      }
      
      this.emit('store-restore-completed', { storeName, data: storeDoc.data, adapter: this.name });
      return storeDoc.data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Store restore failed';
      this.emit('store-restore-failed', { storeName, error, adapter: this.name });
      throw error;
    }
  }

  // MongoDB-specific methods
  async executeQuery(query: MongoDBQuery): Promise<any> {
    if (!this.connected) {
      throw new Error('MongoDB Atlas adapter is not connected');
    }

    try {
      const response = await fetch(`${this.getAtlasDataAPIEndpoint()}/action/${query.operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': this.config.atlas?.apiKey || this.config.connectionString
        },
        body: JSON.stringify({
          dataSource: this.config.atlas?.clusterName,
          database: this.config.databaseName,
          collection: query.collection,
          ...this.buildQueryBody(query)
        })
      });

      if (!response.ok) {
        throw new Error(`MongoDB query failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.document || result.documents || result;
    } catch (error) {
      this.logger.error('MongoDB query failed:', error);
      throw error;
    }
  }

  async search(query: MongoDBSearchQuery): Promise<any> {
    if (!this.config.search?.enabled) {
      throw new Error('MongoDB Atlas Search is not enabled');
    }

    try {
      const pipeline = [
        {
          $search: {
            index: query.index,
            ...this.buildSearchQuery(query)
          }
        }
      ];

      if (query.limit) {
        pipeline.push({ $limit: query.limit } as any);
      }
      
      if (query.skip) {
        pipeline.push({ $skip: query.skip } as any);
      }

      const result = await this.executeQuery({
        collection: 'search_collection', // This would be dynamic
        operation: 'aggregate',
        pipeline
      });

      this.emit('search-completed', { query, result });
      return result;
    } catch (error) {
      this.emit('search-failed', { query, error });
      throw error;
    }
  }

  async createIndex(collection: string, indexSpec: Record<string, any>, options?: Record<string, any>): Promise<string> {
    try {
      const response = await fetch(`${this.getAtlasDataAPIEndpoint()}/action/createIndex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.atlas?.apiKey || this.config.connectionString
        },
        body: JSON.stringify({
          dataSource: this.config.atlas?.clusterName,
          database: this.config.databaseName,
          collection,
          keys: indexSpec,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Index creation failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('index-created', { collection, indexSpec, result });
      return result.indexName;
    } catch (error) {
      this.logger.error('Failed to create index:', error);
      throw error;
    }
  }

  async runAggregation(collection: string, pipeline: any[]): Promise<any> {
    return this.executeQuery({
      collection,
      operation: 'aggregate',
      pipeline
    });
  }

  async countDocuments(collection: string, filter: Record<string, any> = {}): Promise<number> {
    try {
      const response = await fetch(`${this.getAtlasDataAPIEndpoint()}/action/aggregate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.atlas?.apiKey || this.config.connectionString
        },
        body: JSON.stringify({
          dataSource: this.config.atlas?.clusterName,
          database: this.config.databaseName,
          collection,
          pipeline: [
            { $match: filter },
            { $count: 'total' }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Count query failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.documents[0]?.total || 0;
    } catch (error) {
      this.logger.error('Failed to count documents:', error);
      throw error;
    }
  }

  // Analytics methods
  async getCollectionStats(collection: string): Promise<{
    size: number;
    count: number;
    avgObjSize: number;
    storageSize: number;
    indexes: number;
    indexSize: number;
  }> {
    try {
      const response = await fetch(`${this.getAtlasDataAPIEndpoint()}/action/aggregate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.atlas?.apiKey || this.config.connectionString
        },
        body: JSON.stringify({
          dataSource: this.config.atlas?.clusterName,
          database: this.config.databaseName,
          collection,
          pipeline: [
            { $collStats: { storageStats: {} } }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Stats query failed: ${response.statusText}`);
      }

      const result = await response.json();
      const stats = result.documents[0];
      
      return {
        size: stats.size || 0,
        count: stats.count || 0,
        avgObjSize: stats.avgObjSize || 0,
        storageSize: stats.storageSize || 0,
        indexes: stats.nindexes || 0,
        indexSize: stats.totalIndexSize || 0
      };
    } catch (error) {
      this.logger.error('Failed to get collection stats:', error);
      throw error;
    }
  }

  async runAnalyticsPipeline(
    collection: string,
    pipeline: any[],
    options?: { timeout?: number; allowDiskUse?: boolean }
  ): Promise<any> {
    try {
      const response = await fetch(`${this.getAtlasDataAPIEndpoint()}/action/aggregate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.atlas?.apiKey || this.config.connectionString
        },
        body: JSON.stringify({
          dataSource: this.config.atlas?.clusterName,
          database: this.config.databaseName,
          collection,
          pipeline,
          options: {
            maxTimeMS: options?.timeout || this.config.analytics?.pipelineTimeout || 30000,
            allowDiskUse: options?.allowDiskUse || true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics pipeline failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('analytics-completed', { collection, pipeline, result });
      return result.documents;
    } catch (error) {
      this.emit('analytics-failed', { collection, pipeline, error });
      throw error;
    }
  }

  // Change Streams (Real-time)
  async watchCollection(
    collection: string,
    _pipeline?: any[],
    callback?: (change: any) => void
  ): Promise<() => void> {
    try {
      // This would use MongoDB Change Streams
      // For now, simulate with polling
      const watchId = setInterval(async () => {
        try {
          // Poll for recent changes
          const recentChanges = await this.executeQuery({
            collection: `${collection}_changes`,
            operation: 'find',
            filter: {
              timestamp: { $gte: new Date(Date.now() - 5000) } // Last 5 seconds
            },
            options: { sort: { timestamp: -1 } }
          });

          if (recentChanges && recentChanges.length > 0 && callback) {
            recentChanges.forEach(callback);
          }
        } catch (error) {
          this.logger.error('Change stream error:', error);
        }
      }, 5000);

      this.emit('watch-started', { collection });

      // Return stop function
      return () => {
        clearInterval(watchId);
        this.emit('watch-stopped', { collection });
      };
    } catch (error) {
      this.logger.error('Failed to watch collection:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkWrite(collection: string, operations: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.getAtlasDataAPIEndpoint()}/action/bulkWrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.atlas?.apiKey || this.config.connectionString
        },
        body: JSON.stringify({
          dataSource: this.config.atlas?.clusterName,
          database: this.config.databaseName,
          collection,
          operations
        })
      });

      if (!response.ok) {
        throw new Error(`Bulk write failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('bulk-write-completed', { collection, operations, result });
      return result;
    } catch (error) {
      this.emit('bulk-write-failed', { collection, operations, error });
      throw error;
    }
  }

  // Private methods
  private getAtlasDataAPIEndpoint(): string {
    return `https://data.mongodb-api.com/app/${this.config.atlas?.projectId}/endpoint/data/v1`;
  }

  private buildQueryBody(query: MongoDBQuery): Record<string, any> {
    const body: Record<string, any> = {};

    if (query.filter) body['filter'] = query.filter;
    if (query.document) body['document'] = query.document;
    if (query.documents) body['documents'] = query.documents;
    if (query.update) body['update'] = query.update;
    if (query.pipeline) body['pipeline'] = query.pipeline;
    if (query.options) {
      if (query.options.sort) body['sort'] = query.options.sort;
      if (query.options.limit) body['limit'] = query.options.limit;
      if (query.options.skip) body['skip'] = query.options.skip;
      if (query.options.projection) body['projection'] = query.options.projection;
      if (query.options.upsert) body['upsert'] = query.options.upsert;
    }

    return body;
  }

  private buildSearchQuery(query: MongoDBSearchQuery): Record<string, any> {
    const searchQuery: Record<string, any> = {};

    if (query.text) {
      searchQuery['text'] = query.text;
    }
    
    if (query.compound) {
      searchQuery['compound'] = query.compound;
    }
    
    if (query.highlight) {
      searchQuery['highlight'] = query.highlight;
    }

    return searchQuery;
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
      maxDataSize: 16 * 1024 * 1024, // 16MB document limit
      supportedFormats: ['json', 'bson']
    };
  }
}
