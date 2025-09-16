/**
 * Brolostack - Storage Type Definitions
 */
export interface StorageConfig {
    name: string;
    storeName?: string;
    description?: string;
    size?: number;
    version?: number;
    driver?: StorageDriver[];
}
export type StorageDriver = 'localStorageWrapper' | 'indexedDB' | 'webSQLStorage' | 'localforage';
export interface StorageItem<T = any> {
    key: string;
    value: T;
    timestamp: number;
    version: number;
    metadata?: {
        size: number;
        compressed?: boolean;
        encrypted?: boolean;
        checksum?: string;
        expires?: number;
    };
}
export interface StorageQuery {
    key?: string | RegExp;
    value?: any;
    timestamp?: {
        from?: number;
        to?: number;
    };
    version?: number;
    limit?: number;
    offset?: number;
    sortBy?: 'key' | 'timestamp' | 'version';
    sortOrder?: 'asc' | 'desc';
}
export interface StorageStats {
    totalItems: number;
    totalSize: number;
    availableSpace: number;
    usedSpace: number;
    oldestItem?: StorageItem | undefined;
    newestItem?: StorageItem | undefined;
    averageItemSize: number;
}
export interface StorageBackup {
    version: string;
    timestamp: number;
    data: Record<string, StorageItem>;
    metadata: {
        totalItems: number;
        totalSize: number;
        appName: string;
        appVersion: string;
    };
}
export interface StorageMigration {
    fromVersion: number;
    toVersion: number;
    migrate: (data: any) => any;
    rollback?: (data: any) => any;
}
export interface StorageEncryption {
    algorithm: string;
    key: string | CryptoKey;
    iv?: Uint8Array;
}
export interface StorageCompression {
    algorithm: 'gzip' | 'deflate' | 'lz4';
    level?: number;
}
export interface StorageTransaction {
    id: string;
    operations: StorageOperation[];
    status: 'pending' | 'committed' | 'rolled-back';
    timestamp: number;
}
export interface StorageOperation {
    type: 'get' | 'set' | 'delete' | 'clear';
    key: string;
    value?: any;
    oldValue?: any;
}
export interface StorageEvent {
    type: 'create' | 'update' | 'delete' | 'clear' | 'error';
    key: string;
    value?: any;
    oldValue?: any;
    timestamp: number;
    transactionId?: string;
}
export interface StorageIndex {
    name: string;
    keyPath: string | string[];
    unique?: boolean;
    multiEntry?: boolean;
}
export interface StorageSchema {
    version: number;
    stores: StorageStoreSchema[];
    migrations?: StorageMigration[];
}
export interface StorageStoreSchema {
    name: string;
    keyPath: string;
    autoIncrement?: boolean;
    indexes?: StorageIndex[];
}
export interface StorageOptions {
    encryption?: StorageEncryption;
    compression?: StorageCompression;
    backup?: {
        enabled: boolean;
        interval: number;
        maxBackups: number;
    };
    sync?: {
        enabled: boolean;
        conflictResolution: 'last-write-wins' | 'merge' | 'custom';
        customResolver?: (local: any, remote: any) => any;
    };
    validation?: {
        enabled: boolean;
        schema?: any;
        validator?: (value: any) => boolean;
    };
}
//# sourceMappingURL=storage.d.ts.map