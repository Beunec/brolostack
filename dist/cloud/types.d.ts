/**
 * Cloud Integration Types
 * Defines interfaces for cloud service integrations
 */
export interface CloudAdapter {
    name: string;
    provider: string;
    connect(config: any): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
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
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    syncAllStores(): Promise<void>;
    restoreAllStores(): Promise<void>;
    createBackup(): Promise<void>;
    restoreBackup(backupId: string): Promise<void>;
    listBackups(): Promise<CloudBackup[]>;
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
//# sourceMappingURL=types.d.ts.map