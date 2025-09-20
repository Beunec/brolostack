/**
 * Universal SQL Adapter for Brolostack
 * Supports multiple SQL databases: PostgreSQL, MySQL, SQLite, SQL Server, Oracle
 */

import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export type SQLDialect = 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'oracle' | 'mariadb';

export interface SQLConfig {
  dialect: SQLDialect;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  filename?: string; // For SQLite
  options?: {
    ssl?: boolean;
    pool?: {
      min: number;
      max: number;
      idle: number;
      acquire: number;
      evict: number;
    };
    timezone?: string;
    charset?: string;
    collate?: string;
    logging?: boolean;
    benchmark?: boolean;
    isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  };
  migrations?: {
    enabled: boolean;
    directory: string;
    tableName: string;
  };
}

export interface SQLQueryBuilder {
  select(columns?: string[]): SQLQueryBuilder;
  from(table: string): SQLQueryBuilder;
  where(condition: string | Record<string, any>): SQLQueryBuilder;
  join(table: string, condition: string, type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'): SQLQueryBuilder;
  groupBy(columns: string[]): SQLQueryBuilder;
  having(condition: string | Record<string, any>): SQLQueryBuilder;
  orderBy(column: string, direction?: 'ASC' | 'DESC'): SQLQueryBuilder;
  limit(count: number): SQLQueryBuilder;
  offset(count: number): SQLQueryBuilder;
  build(): { sql: string; params: any[] };
}

export interface SQLMigration {
  version: string;
  name: string;
  up: string;
  down: string;
  timestamp: Date;
}

export class SQLAdapter extends EventEmitter implements CloudAdapter {
  public readonly name = 'sql';
  public readonly provider: string;
  
  private config: SQLConfig;
  private connected = false;
  private errorCount = 0;
  private lastError?: string;
  private lastSync?: Date;
  private lastBackup?: Date;
  private logger: Logger;
  // private queryBuilder: SQLQueryBuilder; // Reserved for future query building

  constructor(config: SQLConfig) {
    super();
    this.config = config;
    this.provider = `SQL (${config.dialect})`;
    this.logger = new Logger(false, 'SQLAdapter');
    // this.queryBuilder = new QueryBuilder(config.dialect); // Reserved for future query building
  }

  async connect(): Promise<void> {
    try {
      // Test connection based on dialect
      await this.testConnection();
      
      // Run migrations if enabled
      if (this.config.migrations?.enabled) {
        await this.runMigrations();
      }
      
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
      throw new Error('SQL adapter is not connected');
    }

    try {
      await this.ensureSyncTable();
      
      // const _insertQuery = this.queryBuilder // Reserved for future batch insert optimization
      //   .from('brolostack_sync')
      //   .build();

      await this.executeQuery(`
        INSERT INTO brolostack_sync (data, timestamp, checksum, sync_type)
        VALUES (?, ?, ?, ?)
      `, [
        JSON.stringify(data),
        new Date(),
        this.generateChecksum(data),
        'full'
      ]);
      
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
      throw new Error('SQL adapter is not connected');
    }

    try {
      await this.ensureBackupTable();
      
      const backupId = `backup_${Date.now()}`;
      
      await this.executeQuery(`
        INSERT INTO brolostack_backups (backup_id, data, timestamp, size, checksum)
        VALUES (?, ?, ?, ?, ?)
      `, [
        backupId,
        JSON.stringify(data),
        new Date(),
        JSON.stringify(data).length,
        this.generateChecksum(data)
      ]);
      
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
      throw new Error('SQL adapter is not connected');
    }

    try {
      const result = await this.executeQuery(`
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
      throw new Error('SQL adapter is not connected');
    }

    try {
      await this.ensureStoreTable();
      
      const upsertQuery = this.getUpsertQuery();
      
      await this.executeQuery(upsertQuery, [
        storeName,
        JSON.stringify(data),
        new Date(),
        this.generateChecksum(data)
      ]);
      
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
      throw new Error('SQL adapter is not connected');
    }

    try {
      const result = await this.executeQuery(`
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

  // SQL-specific methods
  async executeQuery(sql: string, params?: any[]): Promise<any[]> {
    if (!this.connected) {
      throw new Error('SQL adapter is not connected');
    }

    try {
      const response = await fetch('/api/sql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql,
          params,
          dialect: this.config.dialect,
          database: this.config.database
        })
      });

      if (!response.ok) {
        throw new Error(`SQL query failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('query-executed', { sql, params, result, dialect: this.config.dialect });
      return result.rows || result;
    } catch (error) {
      this.logger.error('SQL query failed:', error);
      throw error;
    }
  }

  createQueryBuilder(): SQLQueryBuilder {
    return new QueryBuilder(this.config.dialect);
  }

  // Migration management
  async runMigrations(): Promise<void> {
    if (!this.config.migrations?.enabled) {
      return;
    }

    try {
      await this.ensureMigrationTable();
      
      const response = await fetch('/api/sql/migrations/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dialect: this.config.dialect,
          database: this.config.database,
          directory: this.config.migrations.directory
        })
      });

      if (!response.ok) {
        throw new Error(`Migration failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('migrations-completed', { result });
      this.logger.info(`Ran ${result.executed} migrations`);
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  async createMigration(name: string, up: string, down: string): Promise<string> {
    const migration: SQLMigration = {
      version: Date.now().toString(),
      name,
      up,
      down,
      timestamp: new Date()
    };

    const response = await fetch('/api/sql/migrations/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        migration,
        dialect: this.config.dialect
      })
    });

    if (!response.ok) {
      throw new Error(`Migration creation failed: ${response.statusText}`);
    }

    const result = await response.json();
    this.emit('migration-created', { migration, filename: result.filename });
    return result.filename;
  }

  // Private methods
  private async testConnection(): Promise<void> {
    const testQueries = {
      postgresql: 'SELECT 1',
      mysql: 'SELECT 1',
      sqlite: 'SELECT 1',
      mssql: 'SELECT 1',
      oracle: 'SELECT 1 FROM DUAL',
      mariadb: 'SELECT 1'
    };

    const testQuery = testQueries[this.config.dialect];
    await this.executeQuery(testQuery);
  }

  private getUpsertQuery(): string {
    const upsertQueries = {
      postgresql: `
        INSERT INTO brolostack_stores (store_name, data, timestamp, checksum)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (store_name)
        DO UPDATE SET data = EXCLUDED.data, timestamp = EXCLUDED.timestamp, checksum = EXCLUDED.checksum
      `,
      mysql: `
        INSERT INTO brolostack_stores (store_name, data, timestamp, checksum)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data), timestamp = VALUES(timestamp), checksum = VALUES(checksum)
      `,
      sqlite: `
        INSERT OR REPLACE INTO brolostack_stores (store_name, data, timestamp, checksum)
        VALUES (?, ?, ?, ?)
      `,
      mssql: `
        MERGE brolostack_stores AS target
        USING (VALUES (?, ?, ?, ?)) AS source (store_name, data, timestamp, checksum)
        ON target.store_name = source.store_name
        WHEN MATCHED THEN UPDATE SET data = source.data, timestamp = source.timestamp, checksum = source.checksum
        WHEN NOT MATCHED THEN INSERT (store_name, data, timestamp, checksum) VALUES (source.store_name, source.data, source.timestamp, source.checksum);
      `,
      oracle: `
        MERGE INTO brolostack_stores target
        USING (SELECT ? as store_name, ? as data, ? as timestamp, ? as checksum FROM DUAL) source
        ON (target.store_name = source.store_name)
        WHEN MATCHED THEN UPDATE SET data = source.data, timestamp = source.timestamp, checksum = source.checksum
        WHEN NOT MATCHED THEN INSERT (store_name, data, timestamp, checksum) VALUES (source.store_name, source.data, source.timestamp, source.checksum)
      `,
      mariadb: `
        INSERT INTO brolostack_stores (store_name, data, timestamp, checksum)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data), timestamp = VALUES(timestamp), checksum = VALUES(checksum)
      `
    };

    return upsertQueries[this.config.dialect];
  }

  private async ensureSyncTable(): Promise<void> {
    const createTableQueries = {
      postgresql: `
        CREATE TABLE IF NOT EXISTS brolostack_sync (
          id SERIAL PRIMARY KEY,
          data JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64),
          sync_type VARCHAR(20) DEFAULT 'full'
        );
        CREATE INDEX IF NOT EXISTS idx_brolostack_sync_timestamp ON brolostack_sync(timestamp);
      `,
      mysql: `
        CREATE TABLE IF NOT EXISTS brolostack_sync (
          id INT AUTO_INCREMENT PRIMARY KEY,
          data LONGTEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64),
          sync_type VARCHAR(20) DEFAULT 'full',
          INDEX idx_timestamp (timestamp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
      sqlite: `
        CREATE TABLE IF NOT EXISTS brolostack_sync (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          checksum TEXT,
          sync_type TEXT DEFAULT 'full'
        );
        CREATE INDEX IF NOT EXISTS idx_brolostack_sync_timestamp ON brolostack_sync(timestamp);
      `,
      mssql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='brolostack_sync' AND xtype='U')
        CREATE TABLE brolostack_sync (
          id INT IDENTITY(1,1) PRIMARY KEY,
          data NVARCHAR(MAX) NOT NULL,
          timestamp DATETIME2 DEFAULT GETUTCDATE(),
          checksum VARCHAR(64),
          sync_type VARCHAR(20) DEFAULT 'full'
        );
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_brolostack_sync_timestamp')
        CREATE INDEX idx_brolostack_sync_timestamp ON brolostack_sync(timestamp);
      `,
      oracle: `
        BEGIN
          EXECUTE IMMEDIATE 'CREATE TABLE brolostack_sync (
            id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            data CLOB NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            checksum VARCHAR2(64),
            sync_type VARCHAR2(20) DEFAULT ''full''
          )';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN RAISE; END IF;
        END;
      `,
      mariadb: `
        CREATE TABLE IF NOT EXISTS brolostack_sync (
          id INT AUTO_INCREMENT PRIMARY KEY,
          data LONGTEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64),
          sync_type VARCHAR(20) DEFAULT 'full',
          INDEX idx_timestamp (timestamp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `
    };

    const createQuery = createTableQueries[this.config.dialect];
    await this.executeQuery(createQuery);
  }

  private async ensureBackupTable(): Promise<void> {
    const createTableQueries = {
      postgresql: `
        CREATE TABLE IF NOT EXISTS brolostack_backups (
          id SERIAL PRIMARY KEY,
          backup_id VARCHAR(100) UNIQUE NOT NULL,
          data JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          size INTEGER,
          checksum VARCHAR(64)
        );
        CREATE INDEX IF NOT EXISTS idx_brolostack_backups_timestamp ON brolostack_backups(timestamp);
        CREATE INDEX IF NOT EXISTS idx_brolostack_backups_backup_id ON brolostack_backups(backup_id);
      `,
      mysql: `
        CREATE TABLE IF NOT EXISTS brolostack_backups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          backup_id VARCHAR(100) UNIQUE NOT NULL,
          data LONGTEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          size INT,
          checksum VARCHAR(64),
          INDEX idx_timestamp (timestamp),
          INDEX idx_backup_id (backup_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
      sqlite: `
        CREATE TABLE IF NOT EXISTS brolostack_backups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          backup_id TEXT UNIQUE NOT NULL,
          data TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          size INTEGER,
          checksum TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_brolostack_backups_timestamp ON brolostack_backups(timestamp);
      `,
      mssql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='brolostack_backups' AND xtype='U')
        CREATE TABLE brolostack_backups (
          id INT IDENTITY(1,1) PRIMARY KEY,
          backup_id VARCHAR(100) UNIQUE NOT NULL,
          data NVARCHAR(MAX) NOT NULL,
          timestamp DATETIME2 DEFAULT GETUTCDATE(),
          size INT,
          checksum VARCHAR(64)
        );
      `,
      oracle: `
        BEGIN
          EXECUTE IMMEDIATE 'CREATE TABLE brolostack_backups (
            id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            backup_id VARCHAR2(100) UNIQUE NOT NULL,
            data CLOB NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            size NUMBER,
            checksum VARCHAR2(64)
          )';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN RAISE; END IF;
        END;
      `,
      mariadb: `
        CREATE TABLE IF NOT EXISTS brolostack_backups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          backup_id VARCHAR(100) UNIQUE NOT NULL,
          data LONGTEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          size INT,
          checksum VARCHAR(64),
          INDEX idx_timestamp (timestamp),
          INDEX idx_backup_id (backup_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `
    };

    const createQuery = createTableQueries[this.config.dialect];
    await this.executeQuery(createQuery);
  }

  private async ensureStoreTable(): Promise<void> {
    const createTableQueries = {
      postgresql: `
        CREATE TABLE IF NOT EXISTS brolostack_stores (
          id SERIAL PRIMARY KEY,
          store_name VARCHAR(100) UNIQUE NOT NULL,
          data JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64)
        );
        CREATE INDEX IF NOT EXISTS idx_brolostack_stores_store_name ON brolostack_stores(store_name);
      `,
      mysql: `
        CREATE TABLE IF NOT EXISTS brolostack_stores (
          id INT AUTO_INCREMENT PRIMARY KEY,
          store_name VARCHAR(100) UNIQUE NOT NULL,
          data LONGTEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          checksum VARCHAR(64),
          INDEX idx_store_name (store_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
      sqlite: `
        CREATE TABLE IF NOT EXISTS brolostack_stores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          store_name TEXT UNIQUE NOT NULL,
          data TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          checksum TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_brolostack_stores_store_name ON brolostack_stores(store_name);
      `,
      mssql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='brolostack_stores' AND xtype='U')
        CREATE TABLE brolostack_stores (
          id INT IDENTITY(1,1) PRIMARY KEY,
          store_name VARCHAR(100) UNIQUE NOT NULL,
          data NVARCHAR(MAX) NOT NULL,
          timestamp DATETIME2 DEFAULT GETUTCDATE(),
          checksum VARCHAR(64)
        );
      `,
      oracle: `
        BEGIN
          EXECUTE IMMEDIATE 'CREATE TABLE brolostack_stores (
            id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            store_name VARCHAR2(100) UNIQUE NOT NULL,
            data CLOB NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            checksum VARCHAR2(64)
          )';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN RAISE; END IF;
        END;
      `,
      mariadb: `
        CREATE TABLE IF NOT EXISTS brolostack_stores (
          id INT AUTO_INCREMENT PRIMARY KEY,
          store_name VARCHAR(100) UNIQUE NOT NULL,
          data LONGTEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          checksum VARCHAR(64),
          INDEX idx_store_name (store_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `
    };

    const createQuery = createTableQueries[this.config.dialect];
    await this.executeQuery(createQuery);
  }

  private async ensureMigrationTable(): Promise<void> {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS ${this.config.migrations?.tableName || 'schema_migrations'} (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await this.executeQuery(createQuery);
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
      maxDataSize: this.getMaxDataSize(),
      supportedFormats: ['json', 'sql']
    };
  }

  private getMaxDataSize(): number {
    const maxSizes = {
      postgresql: 1024 * 1024 * 1024, // 1GB
      mysql: 4 * 1024 * 1024 * 1024, // 4GB (LONGTEXT)
      sqlite: 1024 * 1024 * 1024, // 1GB
      mssql: 2 * 1024 * 1024 * 1024, // 2GB (NVARCHAR(MAX))
      oracle: 4000, // 4000 bytes for VARCHAR2, much larger for CLOB
      mariadb: 4 * 1024 * 1024 * 1024 // 4GB (LONGTEXT)
    };

    return maxSizes[this.config.dialect] || 1024 * 1024; // 1MB default
  }
}

// Query Builder Implementation
class QueryBuilder implements SQLQueryBuilder {
  private dialect: SQLDialect;
  private selectClause: string[] = ['*'];
  private fromClause = '';
  private whereConditions: string[] = [];
  private joinClauses: string[] = [];
  private groupByClause: string[] = [];
  private havingConditions: string[] = [];
  private orderByClause: string[] = [];
  private limitClause?: number;
  private offsetClause?: number;
  private params: any[] = [];

  constructor(dialect: SQLDialect) {
    this.dialect = dialect;
  }

  select(columns?: string[]): SQLQueryBuilder {
    if (columns && columns.length > 0) {
      this.selectClause = columns;
    }
    return this;
  }

  from(table: string): SQLQueryBuilder {
    this.fromClause = table;
    return this;
  }

  where(condition: string | Record<string, any>): SQLQueryBuilder {
    if (typeof condition === 'string') {
      this.whereConditions.push(condition);
    } else {
      Object.entries(condition).forEach(([key, value]) => {
        this.whereConditions.push(`${key} = ?`);
        this.params.push(value);
      });
    }
    return this;
  }

  join(table: string, condition: string, type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' = 'INNER'): SQLQueryBuilder {
    this.joinClauses.push(`${type} JOIN ${table} ON ${condition}`);
    return this;
  }

  groupBy(columns: string[]): SQLQueryBuilder {
    this.groupByClause = columns;
    return this;
  }

  having(condition: string | Record<string, any>): SQLQueryBuilder {
    if (typeof condition === 'string') {
      this.havingConditions.push(condition);
    } else {
      Object.entries(condition).forEach(([key, value]) => {
        this.havingConditions.push(`${key} = ?`);
        this.params.push(value);
      });
    }
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): SQLQueryBuilder {
    this.orderByClause.push(`${column} ${direction}`);
    return this;
  }

  limit(count: number): SQLQueryBuilder {
    this.limitClause = count;
    return this;
  }

  offset(count: number): SQLQueryBuilder {
    this.offsetClause = count;
    return this;
  }

  build(): { sql: string; params: any[] } {
    let sql = `SELECT ${this.selectClause.join(', ')} FROM ${this.fromClause}`;

    if (this.joinClauses.length > 0) {
      sql += ` ${this.joinClauses.join(' ')}`;
    }

    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.groupByClause.length > 0) {
      sql += ` GROUP BY ${this.groupByClause.join(', ')}`;
    }

    if (this.havingConditions.length > 0) {
      sql += ` HAVING ${this.havingConditions.join(' AND ')}`;
    }

    if (this.orderByClause.length > 0) {
      sql += ` ORDER BY ${this.orderByClause.join(', ')}`;
    }

    if (this.limitClause !== undefined) {
      if (this.dialect === 'mssql') {
        // SQL Server uses TOP
        sql = sql.replace('SELECT', `SELECT TOP ${this.limitClause}`);
      } else {
        sql += ` LIMIT ${this.limitClause}`;
      }
    }

    if (this.offsetClause !== undefined && this.dialect !== 'mssql') {
      sql += ` OFFSET ${this.offsetClause}`;
    }

    return { sql, params: this.params };
  }
}
