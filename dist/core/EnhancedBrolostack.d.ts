/**
 * Enhanced Brolostack - Extended Core Framework
 * Adds optional synchronization and backup features
 *
 * This extends the existing Brolostack without breaking changes
 */
import { Brolostack } from './Brolostack';
import { BrolostackConfig } from '../types';
import { SyncManager, SyncConfig } from '../sync/SyncManager';
import { EnhancedStorageAdapter, BackupConfig } from '../storage/EnhancedStorageAdapter';
export interface EnhancedBrolostackConfig extends BrolostackConfig {
    sync?: SyncConfig;
    backup?: BackupConfig;
}
export declare class EnhancedBrolostack extends Brolostack {
    readonly sync?: SyncManager;
    readonly enhancedStorage?: EnhancedStorageAdapter;
    constructor(config: EnhancedBrolostackConfig);
    /**
     * Enable synchronization (optional feature)
     */
    enableSync(serverUrl: string, apiKey: string): void;
    /**
     * Disable synchronization
     */
    disableSync(): void;
    /**
     * Create a backup of all data
     */
    createBackup(): Promise<any>;
    /**
     * Restore from backup
     */
    restoreFromBackup(backupId: string): Promise<boolean>;
    /**
     * Export all data as JSON string
     */
    exportDataAsString(): Promise<string>;
    /**
     * Import data from JSON string
     */
    importDataFromString(data: string): Promise<boolean>;
    /**
     * Get available backups
     */
    getBackups(): any[];
    /**
     * Override createStore to add sync capabilities
     */
    createStore<T>(name: string, initialState: T): any;
}
export default EnhancedBrolostack;
//# sourceMappingURL=EnhancedBrolostack.d.ts.map