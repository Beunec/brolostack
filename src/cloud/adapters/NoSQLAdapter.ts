/**
 * Universal NoSQL Adapter for Brolostack
 * Supports multiple NoSQL databases: MongoDB, CouchDB, DynamoDB, Cassandra, Redis
 */

import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export type NoSQLDialect = 'mongodb' | 'couchdb' | 'dynamodb' | 'cassandra' | 'redis' | 'elasticsearch' | 'neo4j';

export interface NoSQLConfig {
  dialect: NoSQLDialect;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  keyspace?: string; // For Cassandra
  index?: string; // For Elasticsearch
  username?: string;
  password?: string;
  ssl?: boolean;
  authSource?: string; // For MongoDB
  replicaSet?: string; // For MongoDB
  options?: {
    poolSize?: number;
    bufferMaxEntries?: number;
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    serverSelectionTimeoutMS?: number;
    heartbeatFrequencyMS?: number;
    maxStalenessSeconds?: number;
    readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
    writeConcern?: {
      w?: number | 'majority';
      j?: boolean;
      wtimeout?: number;
    };
  };
  aws?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  elasticsearch?: {
    node: string;
    auth?: {
      username: string;
      password: string;
    };
    ssl?: {
      ca?: string;
      cert?: string;
      key?: string;
    };
  };
}

export interface NoSQLQuery {
  collection?: string; // MongoDB, CouchDB
  table?: string; // DynamoDB
  keyspace?: string; // Cassandra
  index?: string; // Elasticsearch
  operation: 'find' | 'findOne' | 'insert' | 'update' | 'delete' | 'aggregate' | 'search';
  filter?: Record<string, any>;
  document?: any;
  documents?: any[];
  update?: Record<string, any>;
  pipeline?: any[]; // For aggregation
  options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
    projection?: Record<string, any>;
    upsert?: boolean;
    multi?: boolean;
  };
  searchQuery?: any; // For Elasticsearch
}

export interface NoSQLIndex {
  name: string;
  fields: Record<string, 1 | -1 | 'text' | '2dsphere'>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    expireAfterSeconds?: number;
    partialFilterExpression?: Record<string, any>;
  };
}

export class NoSQLAdapter extends EventEmitter implements CloudAdapter {
  public readonly name = 'nosql';
  public readonly provider: string;
  
  private config: NoSQLConfig;
  private connected = false;
  private errorCount = 0;
  private lastError?: string;
  private lastSync?: Date;
  private lastBackup?: Date;
  private logger: Logger;

  constructor(config: NoSQLConfig) {
    super();
    this.config = config;
    this.provider = `NoSQL (${config.dialect})`;
    this.logger = new Logger(false, 'NoSQLAdapter');
  }

  async connect(): Promise<void> {
    try {
      await this.testConnection();
      
      this.connected = true;
      this.emit('connected', { adapter: this.name, dialect: this.config.dialect });
      this.logger.info(`Connected to ${this.config.dialect} database`);
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
    this.logger.info(`Disconnected from ${this.config.dialect} database`);
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('NoSQL adapter is not connected');
    }

    try {
      const syncData = {
        data,
        timestamp: new Date(),
        checksum: this.generateChecksum(data),
        syncType: 'full'
      };

      await this.executeQuery({
        collection: 'brolostack_sync',
        operation: 'insert',
        document: syncData
      });
      
      // Clean old sync records
      await this.cleanOldRecords('brolostack_sync', 100);
      
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
      throw new Error('NoSQL adapter is not connected');
    }

    try {
      const backupId = `backup_${Date.now()}`;
      const backupData = {
        backupId,
        data,
        timestamp: new Date(),
        size: JSON.stringify(data).length,
        checksum: this.generateChecksum(data),
        backupType: 'manual'
      };

      await this.executeQuery({
        collection: 'brolostack_backups',
        operation: 'insert',
        document: backupData
      });
      
      // Clean old backups
      await this.cleanOldRecords('brolostack_backups', 50);
      
      this.lastBackup = new Date();
      this.emit('backup-completed', { data, backupId, adapter: this.name });
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      this.emit('backup-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('NoSQL adapter is not connected');
    }

    try {
      const result = await this.executeQuery({
        collection: 'brolostack_sync',
        operation: 'findOne',
        options: {
          sort: { timestamp: -1 }
        }
      });
      
      if (!result) {
        throw new Error('No sync data found');
      }
      
      this.emit('restore-completed', { data: result.data, adapter: this.name });
      return result.data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      this.emit('restore-failed', { error, adapter: this.name });
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('NoSQL adapter is not connected');
    }

    try {
      const storeData = {
        storeName,
        data,
        timestamp: new Date(),
        checksum: this.generateChecksum(data)
      };

      await this.executeQuery({
        collection: 'brolostack_stores',
        operation: 'update',
        filter: { storeName },
        update: { $set: storeData },
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
      throw new Error('NoSQL adapter is not connected');
    }

    try {
      const result = await this.executeQuery({
        collection: 'brolostack_stores',
        operation: 'findOne',
        filter: { storeName }
      });
      
      if (!result) {
        return null;
      }
      
      this.emit('store-restore-completed', { storeName, data: result.data, adapter: this.name });
      return result.data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Store restore failed';
      this.emit('store-restore-failed', { storeName, error, adapter: this.name });
      throw error;
    }
  }

  // NoSQL-specific methods
  async executeQuery(query: NoSQLQuery): Promise<any> {
    if (!this.connected) {
      throw new Error('NoSQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/nosql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...query,
          dialect: this.config.dialect,
          database: this.config.database,
          keyspace: this.config.keyspace,
          index: this.config.index
        })
      });

      if (!response.ok) {
        throw new Error(`NoSQL query failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('query-executed', { query, result, dialect: this.config.dialect });
      return result.data || result;
    } catch (error) {
      this.logger.error('NoSQL query failed:', error);
      throw error;
    }
  }

  // MongoDB-specific methods
  async findDocuments(collection: string, filter: Record<string, any> = {}, options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
    projection?: Record<string, any>;
  }): Promise<any[]> {
    if (this.config.dialect !== 'mongodb') {
      throw new Error('findDocuments is only available for MongoDB');
    }

    return this.executeQuery({
      collection,
      operation: 'find',
      filter,
      options: options || {}
    });
  }

  async insertDocument(collection: string, document: any): Promise<any> {
    if (this.config.dialect !== 'mongodb') {
      throw new Error('insertDocument is only available for MongoDB');
    }

    return this.executeQuery({
      collection,
      operation: 'insert',
      document
    });
  }

  async updateDocument(collection: string, filter: Record<string, any>, update: Record<string, any>, options?: {
    upsert?: boolean;
    multi?: boolean;
  }): Promise<any> {
    if (this.config.dialect !== 'mongodb') {
      throw new Error('updateDocument is only available for MongoDB');
    }

    return this.executeQuery({
      collection,
      operation: 'update',
      filter,
      update,
      options: options || {}
    });
  }

  async aggregateDocuments(collection: string, pipeline: any[]): Promise<any[]> {
    if (this.config.dialect !== 'mongodb') {
      throw new Error('aggregateDocuments is only available for MongoDB');
    }

    return this.executeQuery({
      collection,
      operation: 'aggregate',
      pipeline
    });
  }

  // Elasticsearch-specific methods
  async searchDocuments(index: string, searchQuery: any, options?: {
    from?: number;
    size?: number;
    sort?: any[];
    highlight?: any;
  }): Promise<any> {
    if (this.config.dialect !== 'elasticsearch') {
      throw new Error('searchDocuments is only available for Elasticsearch');
    }

    return this.executeQuery({
      index,
      operation: 'search',
      searchQuery,
      options: options || {}
    });
  }

  async indexDocument(index: string, document: any, id?: string): Promise<any> {
    if (this.config.dialect !== 'elasticsearch') {
      throw new Error('indexDocument is only available for Elasticsearch');
    }

    return this.executeQuery({
      index,
      operation: 'insert',
      document: { ...document, _id: id }
    });
  }

  // DynamoDB-specific methods
  async putItem(table: string, item: Record<string, any>): Promise<any> {
    if (this.config.dialect !== 'dynamodb') {
      throw new Error('putItem is only available for DynamoDB');
    }

    return this.executeQuery({
      table,
      operation: 'insert',
      document: item
    });
  }

  async getItem(table: string, key: Record<string, any>): Promise<any> {
    if (this.config.dialect !== 'dynamodb') {
      throw new Error('getItem is only available for DynamoDB');
    }

    return this.executeQuery({
      table,
      operation: 'findOne',
      filter: key
    });
  }

  async scanTable(table: string, filter?: Record<string, any>, options?: {
    limit?: number;
    startKey?: Record<string, any>;
    projection?: string[];
  }): Promise<any> {
    if (this.config.dialect !== 'dynamodb') {
      throw new Error('scanTable is only available for DynamoDB');
    }

    return this.executeQuery({
      table,
      operation: 'find',
      filter: filter || {},
      options: options || {}
    });
  }

  // Cassandra-specific methods
  async executeCQL(cql: string, params?: any[]): Promise<any> {
    if (this.config.dialect !== 'cassandra') {
      throw new Error('executeCQL is only available for Cassandra');
    }

    const response = await fetch('/api/cassandra/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cql,
        params,
        keyspace: this.config.keyspace
      })
    });

    if (!response.ok) {
      throw new Error(`Cassandra query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Index Management
  async createIndex(indexConfig: NoSQLIndex): Promise<void> {
    try {
      const response = await fetch('/api/nosql/index/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...indexConfig,
          dialect: this.config.dialect,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`Index creation failed: ${response.statusText}`);
      }

      this.emit('index-created', { indexConfig, dialect: this.config.dialect });
    } catch (error) {
      this.logger.error('Failed to create index:', error);
      throw error;
    }
  }

  async dropIndex(indexName: string, collection?: string): Promise<void> {
    try {
      const response = await fetch('/api/nosql/index/drop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          indexName,
          collection,
          dialect: this.config.dialect,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`Index deletion failed: ${response.statusText}`);
      }

      this.emit('index-dropped', { indexName, collection, dialect: this.config.dialect });
    } catch (error) {
      this.logger.error('Failed to drop index:', error);
      throw error;
    }
  }

  async listIndexes(collection?: string): Promise<any[]> {
    try {
      const response = await fetch('/api/nosql/index/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collection,
          dialect: this.config.dialect,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`Index listing failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.indexes || [];
    } catch (error) {
      this.logger.error('Failed to list indexes:', error);
      throw error;
    }
  }

  // Analytics and Monitoring
  async getCollectionStats(collection: string): Promise<{
    documentCount: number;
    storageSize: number;
    averageDocumentSize: number;
    indexCount: number;
    indexSize: number;
  }> {
    try {
      const response = await fetch('/api/nosql/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collection,
          dialect: this.config.dialect,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`Stats query failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.stats;
    } catch (error) {
      this.logger.error('Failed to get collection stats:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(): Promise<{
    operationsPerSecond: number;
    averageLatency: number;
    connectionCount: number;
    memoryUsage: number;
    diskUsage: number;
  }> {
    try {
      const response = await fetch('/api/nosql/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dialect: this.config.dialect,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`Metrics query failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.metrics;
    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  // Real-time features (for supported databases)
  async watchCollection(collection: string, callback: (change: any) => void): Promise<() => void> {
    if (!['mongodb', 'couchdb'].includes(this.config.dialect)) {
      throw new Error(`Real-time watching is not supported for ${this.config.dialect}`);
    }

    try {
      // This would implement change streams for MongoDB or _changes for CouchDB
      const watchId = setInterval(async () => {
        try {
          const changes = await this.executeQuery({
            collection: `${collection}_changes`,
            operation: 'find',
            filter: {
              timestamp: { $gte: new Date(Date.now() - 5000) }
            },
            options: { sort: { timestamp: -1 } }
          });

          if (changes && changes.length > 0) {
            changes.forEach(callback);
          }
        } catch (error) {
          this.logger.error('Watch collection error:', error);
        }
      }, 5000);

      this.emit('watch-started', { collection, dialect: this.config.dialect });

      return () => {
        clearInterval(watchId);
        this.emit('watch-stopped', { collection, dialect: this.config.dialect });
      };
    } catch (error) {
      this.logger.error('Failed to watch collection:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkWrite(collection: string, operations: any[]): Promise<any> {
    try {
      const response = await fetch('/api/nosql/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collection,
          operations,
          dialect: this.config.dialect,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`Bulk operation failed: ${response.statusText}`);
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
  private async testConnection(): Promise<void> {
    const testQueries = {
      mongodb: {
        collection: 'test',
        operation: 'findOne' as const,
        filter: { _id: 'connection_test' }
      },
      couchdb: {
        collection: '_all_dbs',
        operation: 'find' as const
      },
      dynamodb: {
        table: 'test',
        operation: 'findOne' as const,
        filter: { id: 'connection_test' }
      },
      cassandra: {
        keyspace: this.config.keyspace || 'system',
        operation: 'find' as const
      },
      redis: {
        collection: 'test',
        operation: 'findOne' as const,
        filter: { key: 'connection_test' }
      },
      elasticsearch: {
        index: '_cluster',
        operation: 'search' as const,
        searchQuery: { query: { match_all: {} }, size: 1 }
      },
      neo4j: {
        operation: 'find' as const,
        filter: { query: 'MATCH (n) RETURN n LIMIT 1' }
      }
    };

    const testQuery = testQueries[this.config.dialect];
    if (testQuery) {
      await this.executeQuery(testQuery);
    }
  }

  private async cleanOldRecords(collection: string, keepCount: number): Promise<void> {
    try {
      // Get count of records
      const countResult = await this.executeQuery({
        collection,
        operation: 'aggregate',
        pipeline: [{ $count: 'total' }]
      });

      const totalCount = countResult[0]?.total || 0;
      
      if (totalCount > keepCount) {
        // Find old records to delete
        const oldRecords = await this.executeQuery({
          collection,
          operation: 'find',
          options: {
            sort: { timestamp: 1 },
            limit: totalCount - keepCount,
            projection: { _id: 1 }
          }
        });

        if (oldRecords.length > 0) {
          const idsToDelete = oldRecords.map((doc: any) => doc._id);
          await this.executeQuery({
            collection,
            operation: 'delete',
            filter: { _id: { $in: idsToDelete } }
          });
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to clean old records from ${collection}:`, error);
    }
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
    const dialectCapabilities = {
      mongodb: {
        supportsRealTime: true,
        maxDataSize: 16 * 1024 * 1024, // 16MB document limit
        supportedFormats: ['json', 'bson']
      },
      couchdb: {
        supportsRealTime: true,
        maxDataSize: 4 * 1024 * 1024, // 4MB document limit
        supportedFormats: ['json']
      },
      dynamodb: {
        supportsRealTime: true,
        maxDataSize: 400 * 1024, // 400KB item limit
        supportedFormats: ['json']
      },
      cassandra: {
        supportsRealTime: false,
        maxDataSize: 2 * 1024 * 1024, // 2MB partition limit
        supportedFormats: ['json']
      },
      redis: {
        supportsRealTime: true,
        maxDataSize: 512 * 1024 * 1024, // 512MB value limit
        supportedFormats: ['json', 'string', 'binary']
      },
      elasticsearch: {
        supportsRealTime: false,
        maxDataSize: 100 * 1024 * 1024, // 100MB document limit
        supportedFormats: ['json']
      },
      neo4j: {
        supportsRealTime: false,
        maxDataSize: 1024 * 1024, // 1MB property limit
        supportedFormats: ['json']
      }
    };

    const dialectCaps = dialectCapabilities[this.config.dialect];

    return {
      supportsSync: true,
      supportsBackup: true,
      supportsRestore: true,
      supportsRealTime: dialectCaps.supportsRealTime,
      maxDataSize: dialectCaps.maxDataSize,
      supportedFormats: dialectCaps.supportedFormats
    };
  }
}
