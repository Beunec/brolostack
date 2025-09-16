/**
 * Cloud Sync Manager
 * Manages synchronization between local Brolostack stores and cloud services
 */
import { CloudAdapter, CloudSyncManager as ICloudSyncManager, CloudBackup } from './types';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
export interface CloudSyncConfig {
    enabled: boolean;
    adapters: any[];
    syncStrategy: 'local-first' | 'cloud-first' | 'hybrid';
    conflictResolution: 'client-wins' | 'server-wins' | 'merge';
    autoSync?: boolean;
    syncInterval?: number;
}
export declare class CloudSyncManager implements ICloudSyncManager {
    private config;
    private adapters;
    private eventEmitter;
    private logger;
    private enabled;
    private syncInterval?;
    constructor(config: CloudSyncConfig, adapters: Map<string, CloudAdapter>, eventEmitter: EventEmitter, logger: Logger);
    /**
     * Enable cloud synchronization
     */
    enable(): void;
    /**
     * Disable cloud synchronization
     */
    disable(): void;
    /**
     * Check if sync is enabled
     */
    isEnabled(): boolean;
    /**
     * Sync a specific store to cloud
     */
    syncStore(storeName: string, data: any): Promise<void>;
    /**
     * Restore a specific store from cloud
     */
    restoreStore(storeName: string): Promise<any>;
    /**
     * Sync all stores to cloud
     */
    syncAllStores(): Promise<void>;
    /**
     * Restore all stores from cloud
     */
    restoreAllStores(): Promise<void>;
    /**
     * Create a backup of all data
     */
    createBackup(): Promise<void>;
    /**
     * Restore from a specific backup
     */
    restoreBackup(backupId: string): Promise<void>;
    /**
     * List available backups
     */
    listBackups(): Promise<CloudBackup[]>;
    /**
     * Resolve conflicts between local and cloud data
     */
    resolveConflict(storeName: string, localData: any, cloudData: any): Promise<any>;
    /**
     * Merge local and cloud data
     */
    private mergeData;
    /**
     * Start automatic synchronization
     */
    private startAutoSync;
    /**
     * Stop automatic synchronization
     */
    stopAutoSync(): void;
}
//# sourceMappingURL=CloudSyncManager.d.ts.map