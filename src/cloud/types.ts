/**
 * Cloud Integration Types
 * Defines interfaces for cloud service integrations
 */

export interface CloudAdapter {
  name: string;
  provider: string;
  
  // Connection management
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Data operations
  sync(data: any): Promise<void>;
  backup(data: any): Promise<void>;
  restore(): Promise<any>;
  
  // Store-specific operations
  syncStore(storeName: string, data: any): Promise<void>;
  restoreStore(storeName: string): Promise<any>;
  
  // Health and status
  getStatus(): CloudAdapterStatus;
  getCapabilities(): CloudAdapterCapabilities;
}

export interface CloudAdapterStatus {
  connected: boolean;
  lastSync?: Date;
  lastBackup?: Date;
  errorCount: number;
  lastError?: string;
}

export interface CloudAdapterCapabilities {
  supportsSync: boolean;
  supportsBackup: boolean;
  supportsRestore: boolean;
  supportsRealTime: boolean;
  maxDataSize?: number;
  supportedFormats: string[];
}

export interface CloudSyncManager {
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
  
  // Store operations
  syncStore(storeName: string, data: any): Promise<void>;
  restoreStore(storeName: string): Promise<any>;
  
  // Bulk operations
  syncAllStores(): Promise<void>;
  restoreAllStores(): Promise<void>;
  
  // Backup operations
  createBackup(): Promise<void>;
  restoreBackup(backupId: string): Promise<void>;
  listBackups(): Promise<CloudBackup[]>;
  
  // Conflict resolution
  resolveConflict(storeName: string, localData: any, cloudData: any): Promise<any>;
}

export interface CloudBackup {
  id: string;
  timestamp: Date;
  size: number;
  stores: string[];
  checksum: string;
}

export interface CloudSyncEvent {
  type: 'sync-started' | 'sync-completed' | 'sync-failed' | 'conflict-detected';
  storeName?: string;
  data?: any;
  error?: Error;
  timestamp: Date;
}

// Cloud provider specific configurations
export interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName?: string;
  tableName?: string;
}

export interface GoogleCloudConfig {
  projectId: string;
  serviceAccountKey: string;
  bucketName?: string;
  collectionName?: string;
}

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  databaseId?: string;
  bucketName?: string;
}

export interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
  collectionName?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}
