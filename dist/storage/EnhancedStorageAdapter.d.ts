/**
 * Enhanced Storage Adapter
 * Extends LocalStorageAdapter with backup and recovery features
 *
 * This is an ADDITIVE feature that doesn't break existing functionality
 */
import { LocalStorageAdapter } from './LocalStorageAdapter';
export interface BackupConfig {
    enabled: boolean;
    autoBackup: boolean;
    backupInterval?: number;
    maxBackups?: number;
    cloudBackup?: {
        enabled: boolean;
        provider: 'google-drive' | 'dropbox' | 'custom';
        apiKey?: string;
    };
}
export interface BackupInfo {
    id: string;
    timestamp: number;
    size: number;
    storeNames: string[];
    checksum: string;
}
export declare class EnhancedStorageAdapter extends LocalStorageAdapter {
    private backupConfig;
    private backups;
    constructor(config: any, backupConfig?: BackupConfig);
    /**
     * Create a backup of all data
     */
    createEnhancedBackup(): Promise<BackupInfo>;
    /**
     * Restore from backup
     */
    restoreFromBackup(backupId: string): Promise<boolean>;
    /**
     * Export data for manual backup
     */
    exportData(): Promise<string>;
    /**
     * Import data from manual backup
     */
    importData(data: string): Promise<boolean>;
    /**
     * Get list of available backups
     */
    getBackups(): BackupInfo[];
    /**
     * Delete a backup
     */
    deleteBackup(backupId: string): boolean;
    private startAutoBackup;
    private generateChecksum;
}
//# sourceMappingURL=EnhancedStorageAdapter.d.ts.map