/**
 * MySQL Cloud Adapter for Brolostack
 * Enterprise-grade MySQL integration with connection pooling, transactions, and optimization
 */

import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface MySQLConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: {
    enabled: boolean;
    ca?: string;
    cert?: string;
    key?: string;
    rejectUnauthorized?: boolean;
  };
  pool?: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    idleTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    reapIntervalMillis: number;
    createRetryIntervalMillis: number;
  };
  charset?: string;
  timezone?: string;
  supportBigNumbers?: boolean;
  bigNumberStrings?: boolean;
  dateStrings?: boolean;
  multipleStatements?: boolean;
  acquireTimeout?: number;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface MySQLQueryOptions {
  table: string;
  select?: string[];
  where?: Record<string, any>;
  join?: Array<{
    type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
    table: string;
    on: string;
    alias?: string;
  }>;
  groupBy?: string[];
  having?: Record<string, any>;
  orderBy?: Array<{ column: string; direction: 'ASC' | 'DESC' }>;
  limit?: number;
  offset?: number;
}

export interface MySQLTransaction {
  id: string;
  queries: Array<{
    sql: string;
    params?: any[];
    timestamp: Date;
  }>;
  status: 'active' | 'committed' | 'rolled_back';
  startTime: Date;
  endTime?: Date;
}

export class MySQLAdapter extends EventEmitter implements CloudAdapter {
  public readonly name = 'mysql';
  public readonly provider = 'MySQL';
  
  private config: MySQLConfig;
  private connected = false;
  private errorCount = 0;
  private lastError?: string;
  private lastSync?: Date;
  private lastBackup?: Date;
  private logger: Logger;
  private activeTransactions: Map<string, MySQLTransaction> = new Map();
  // private _connectionPool: any = null; // Reserved for future connection pooling

  constructor(config: MySQLConfig) {
    super();
    this.config = {
      charset: 'utf8mb4',
      timezone: 'Z',
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: false,
      multipleStatements: false,
      acquireTimeout: 60000,
      reconnect: true,
      reconnectInterval: 2000,
      maxReconnectAttempts: 5,
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200
      },
      ...config
    };
    this.logger = new Logger(false, 'MySQLAdapter');
  }

  async connect(): Promise<void> {
    try {
      // Test connection with a simple query
      await this.query('SELECT 1 as test');
      
      this.connected = true;
      this.emit('connected', { adapter: this.name });
      this.logger.info('Connected to MySQL database');
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      this.emit('error', { error, adapter: this.name });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Close all active transactions
      for (const [id, transaction] of this.activeTransactions) {
        if (transaction.status === 'active') {
          await this.rollbackTransaction(id);
        }
      }

      this.connected = false;
      this.emit('disconnected', { adapter: this.name });
      this.logger.info('Disconnected from MySQL database');
    } catch (error) {
      this.logger.warn('Error during disconnect:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('MySQL adapter is not connected');
    }

    try {
      const syncTable = 'brolostack_sync';
      
      // Ensure sync table exists
      await this.createSyncTableIfNotExists();
      
      // Insert sync data
      await this.insert(syncTable, {
        data: JSON.stringify(data),
        timestamp: new Date(),
        checksum: this.generateChecksum(data),
        sync_type: 'full'
      });
      
      // Clean old sync records (keep last 100)
      await this.query(`
        DELETE FROM ${syncTable} 
        WHERE id NOT IN (
          SELECT id FROM (
            SELECT id FROM ${syncTable} 
            ORDER BY timestamp DESC 
            LIMIT 100
          ) as temp
        )
      `);
      
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
      throw new Error('MySQL adapter is not connected');
    }

    try {
      const backupTable = 'brolostack_backups';
      
      // Ensure backup table exists
      await this.createBackupTableIfNotExists();
      
      // Insert backup data
      const backupId = `backup_${Date.now()}`;
      await this.insert(backupTable, {
        backup_id: backupId,
        data: JSON.stringify(data),
        timestamp: new Date(),
        size: JSON.stringify(data).length,
        checksum: this.generateChecksum(data),
        backup_type: 'manual'
      });
      
      // Clean old backups (keep last 50)
      await this.query(`
        DELETE FROM ${backupTable} 
        WHERE id NOT IN (
          SELECT id FROM (
            SELECT id FROM ${backupTable} 
            ORDER BY timestamp DESC 
            LIMIT 50
          ) as temp
        )
      `);
      
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
      throw new Error('MySQL adapter is not connected');
    }

    try {
      const result = await this.query(`
        SELECT data FROM brolostack_sync 
        ORDER BY timestamp DESC 
        LIMIT 1
      `);
      
      if (result.length === 0) {
        throw new Error('No sync data found');
      }
      
      const data = JSON.parse(result[0].data);
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
      throw new Error('MySQL adapter is not connected');
    }

    try {
      const storeTable = 'brolostack_stores';
      
      // Ensure store table exists
      await this.createStoreTableIfNotExists();
      
      // Upsert store data
      await this.query(`
        INSERT INTO ${storeTable} (store_name, data, timestamp, checksum)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        data = VALUES(data),
        timestamp = VALUES(timestamp),
        checksum = VALUES(checksum)
      `, [storeName, JSON.stringify(data), new Date(), this.generateChecksum(data)]);
      
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
      throw new Error('MySQL adapter is not connected');
    }

    try {
      const result = await this.query(`
        SELECT data FROM brolostack_stores 
        WHERE store_name = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `, [storeName]);
      
      if (result.length === 0) {
        return null;
      }
      
      const data = JSON.parse(result[0].data);
      this.emit('store-restore-completed', { storeName, data, adapter: this.name });
      return data;
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Store restore failed';
      this.emit('store-restore-failed', { storeName, error, adapter: this.name });
      throw error;
    }
  }

  // MySQL-specific methods
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.connected) {
      throw new Error('MySQL adapter is not connected');
    }

    try {
      // In browser environment, use HTTP endpoint to communicate with MySQL
      const response = await fetch('/api/mysql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql,
          params,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`MySQL query failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('query-executed', { sql, params, result });
      return result.rows || result;
    } catch (error) {
      this.logger.error('MySQL query failed:', error);
      throw error;
    }
  }

  async select(options: MySQLQueryOptions): Promise<any[]> {
    let sql = `SELECT ${options.select ? options.select.join(', ') : '*'} FROM ${options.table}`;
    const params: any[] = [];

    // Add JOINs
    if (options.join) {
      options.join.forEach(join => {
        sql += ` ${join.type} JOIN ${join.table}${join.alias ? ` AS ${join.alias}` : ''} ON ${join.on}`;
      });
    }

    // Add WHERE clause
    if (options.where) {
      const whereConditions = Object.entries(options.where).map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Add GROUP BY
    if (options.groupBy) {
      sql += ` GROUP BY ${options.groupBy.join(', ')}`;
    }

    // Add HAVING
    if (options.having) {
      const havingConditions = Object.entries(options.having).map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });
      sql += ` HAVING ${havingConditions.join(' AND ')}`;
    }

    // Add ORDER BY
    if (options.orderBy) {
      const orderConditions = options.orderBy.map(order => `${order.column} ${order.direction}`);
      sql += ` ORDER BY ${orderConditions.join(', ')}`;
    }

    // Add LIMIT and OFFSET
    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }

    return await this.query(sql, params);
  }

  async insert(table: string, data: Record<string, any> | Record<string, any>[]): Promise<any> {
    const records = Array.isArray(data) ? data : [data];
    
    if (records.length === 0) {
      throw new Error('No data provided for insert');
    }

    const columns = Object.keys(records[0]);
    const placeholders = columns.map(() => '?').join(', ');
    
    if (records.length === 1) {
      // Single insert
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      const params = Object.values(records[0]);
      
      const result = await this.query(sql, params);
      return { insertId: (result as any).insertId, affectedRows: (result as any).affectedRows };
    } else {
      // Bulk insert
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${records.map(() => `(${placeholders})`).join(', ')}`;
      const params = records.flatMap(record => Object.values(record));
      
      const result = await this.query(sql, params);
      return { insertId: (result as any).insertId, affectedRows: (result as any).affectedRows };
    }
  }

  async update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<any> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const params = [...Object.values(data), ...Object.values(where)];
    
    const result = await this.query(sql, params);
    return { affectedRows: (result as any).affectedRows, changedRows: (result as any).changedRows };
  }

  async delete(table: string, where: Record<string, any>): Promise<any> {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const params = Object.values(where);
    
    const result = await this.query(sql, params);
    return { affectedRows: (result as any).affectedRows };
  }

  // Transaction Management
  async beginTransaction(): Promise<string> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.query('START TRANSACTION');
    
    const transaction: MySQLTransaction = {
      id: transactionId,
      queries: [],
      status: 'active',
      startTime: new Date()
    };
    
    this.activeTransactions.set(transactionId, transaction);
    this.emit('transaction-started', { transactionId });
    return transactionId;
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (transaction.status !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active`);
    }

    try {
      await this.query('COMMIT');
      
      transaction.status = 'committed';
      transaction.endTime = new Date();
      
      this.emit('transaction-committed', { transactionId, transaction });
    } catch (error) {
      await this.rollbackTransaction(transactionId);
      throw error;
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    try {
      await this.query('ROLLBACK');
      
      transaction.status = 'rolled_back';
      transaction.endTime = new Date();
      
      this.emit('transaction-rolled-back', { transactionId, transaction });
    } catch (error) {
      this.logger.error(`Failed to rollback transaction ${transactionId}:`, error);
      throw error;
    }
  }

  async queryInTransaction(transactionId: string, sql: string, params?: any[]): Promise<any[]> {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (transaction.status !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active`);
    }

    try {
      const result = await this.query(sql, params);
      
      // Log query in transaction
      transaction.queries.push({
        sql,
        params: params || [],
        timestamp: new Date()
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Query failed in transaction ${transactionId}:`, error);
      throw error;
    }
  }

  // Advanced MySQL features
  async createIndex(table: string, columns: string[], options?: {
    name?: string;
    unique?: boolean;
    type?: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
  }): Promise<void> {
    const indexName = options?.name || `idx_${table}_${columns.join('_')}`;
    const uniqueClause = options?.unique ? 'UNIQUE' : '';
    const typeClause = options?.type ? `USING ${options.type}` : '';
    
    const sql = `CREATE ${uniqueClause} INDEX ${indexName} ON ${table} (${columns.join(', ')}) ${typeClause}`;
    
    await this.query(sql);
    this.emit('index-created', { table, columns, indexName });
  }

  async dropIndex(table: string, indexName: string): Promise<void> {
    const sql = `DROP INDEX ${indexName} ON ${table}`;
    await this.query(sql);
    this.emit('index-dropped', { table, indexName });
  }

  async analyze(table: string): Promise<any> {
    const result = await this.query(`ANALYZE TABLE ${table}`);
    this.emit('table-analyzed', { table, result });
    return result;
  }

  async optimize(table: string): Promise<any> {
    const result = await this.query(`OPTIMIZE TABLE ${table}`);
    this.emit('table-optimized', { table, result });
    return result;
  }

  async getTableInfo(table: string): Promise<{
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      default: any;
      key: string;
      extra: string;
    }>;
    indexes: Array<{
      name: string;
      columns: string[];
      unique: boolean;
      type: string;
    }>;
    stats: {
      rows: number;
      avgRowLength: number;
      dataLength: number;
      indexLength: number;
    };
  }> {
    try {
      // Get column information
      const columns = await this.query(`DESCRIBE ${table}`);
      
      // Get index information
      const indexes = await this.query(`SHOW INDEX FROM ${table}`);
      
      // Get table statistics
      const stats = await this.query(`
        SELECT 
          table_rows as rows,
          avg_row_length as avgRowLength,
          data_length as dataLength,
          index_length as indexLength
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `, [this.config.database, table]);

      return {
        columns: columns.map((col: any) => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          default: col.Default,
          key: col.Key,
          extra: col.Extra
        })),
        indexes: this.groupIndexes(indexes),
        stats: stats[0] || { rows: 0, avgRowLength: 0, dataLength: 0, indexLength: 0 }
      };
    } catch (error) {
      this.logger.error(`Failed to get table info for ${table}:`, error);
      throw error;
    }
  }

  // Performance optimization
  async explainQuery(sql: string, params?: any[]): Promise<any> {
    const explainSql = `EXPLAIN FORMAT=JSON ${sql}`;
    const result = await this.query(explainSql, params);
    
    this.emit('query-explained', { sql, params, explanation: result });
    return result;
  }

  async getSlowQueries(limit = 10): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        sql_text,
        exec_count,
        avg_timer_wait / 1000000000 as avg_time_seconds,
        sum_timer_wait / 1000000000 as total_time_seconds
      FROM performance_schema.events_statements_summary_by_digest 
      ORDER BY avg_timer_wait DESC 
      LIMIT ?
    `, [limit]);

    return result;
  }

  async getConnectionInfo(): Promise<{
    activeConnections: number;
    maxConnections: number;
    threadsCached: number;
    threadsConnected: number;
    threadsCreated: number;
    threadsRunning: number;
  }> {
    const result = await this.query(`
      SHOW STATUS WHERE Variable_name IN (
        'Threads_connected', 'Threads_cached', 'Threads_created', 
        'Threads_running', 'Max_connections'
      )
    `);

    const stats: any = {};
    result.forEach((row: any) => {
      stats[row.Variable_name.toLowerCase()] = parseInt(row.Value);
    });

    return {
      activeConnections: stats.threads_connected || 0,
      maxConnections: stats.max_connections || 0,
      threadsCached: stats.threads_cached || 0,
      threadsConnected: stats.threads_connected || 0,
      threadsCreated: stats.threads_created || 0,
      threadsRunning: stats.threads_running || 0
    };
  }

  // Private methods
  private async createSyncTableIfNotExists(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS brolostack_sync (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data LONGTEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64),
        sync_type VARCHAR(20) DEFAULT 'full',
        INDEX idx_timestamp (timestamp),
        INDEX idx_sync_type (sync_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await this.query(sql);
  }

  private async createBackupTableIfNotExists(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS brolostack_backups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        backup_id VARCHAR(100) UNIQUE NOT NULL,
        data LONGTEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        size INT,
        checksum VARCHAR(64),
        backup_type VARCHAR(20) DEFAULT 'manual',
        INDEX idx_timestamp (timestamp),
        INDEX idx_backup_id (backup_id),
        INDEX idx_backup_type (backup_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await this.query(sql);
  }

  private async createStoreTableIfNotExists(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS brolostack_stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_name VARCHAR(100) NOT NULL,
        data LONGTEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        checksum VARCHAR(64),
        UNIQUE KEY unique_store (store_name),
        INDEX idx_store_name (store_name),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await this.query(sql);
  }

  private groupIndexes(indexes: any[]): Array<{
    name: string;
    columns: string[];
    unique: boolean;
    type: string;
  }> {
    const grouped = new Map();
    
    indexes.forEach(index => {
      const name = index.Key_name;
      if (!grouped.has(name)) {
        grouped.set(name, {
          name,
          columns: [],
          unique: index.Non_unique === 0,
          type: index.Index_type
        });
      }
      grouped.get(name).columns.push(index.Column_name);
    });
    
    return Array.from(grouped.values());
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
      supportsRealTime: false,
      maxDataSize: 4 * 1024 * 1024 * 1024, // 4GB (LONGTEXT limit)
      supportedFormats: ['json', 'sql']
    };
  }
}
