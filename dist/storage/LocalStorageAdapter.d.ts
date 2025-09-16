/**
 * Brolostack - Local Storage Adapter
 * Handles browser local storage with encryption, compression, and advanced features
 */
import { StorageAdapter, StorageConfig, StorageItem, StorageStats, StorageBackup } from '../types';
export declare class LocalStorageAdapter implements StorageAdapter {
    private storage;
    private config;
    private isInitialized;
    private logger;
    private stats;
    constructor(config: StorageConfig);
    initialize(): Promise<void>;
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    length(): Promise<number>;
    /**
     * Get storage statistics
     */
    getStats(): StorageStats;
    /**
     * Get available storage space
     */
    getAvailableSpace(): number;
    /**
     * Get used storage space
     */
    getUsedSpace(): number;
    /**
     * Get total storage size
     */
    getSize(): number;
    /**
     * Check if storage is available
     */
    isAvailable(): boolean;
    /**
     * Create a backup of all data
     */
    createBackup(): Promise<StorageBackup>;
    /**
     * Restore from backup
     */
    restoreBackup(backup: StorageBackup): Promise<void>;
    /**
     * Get items with pagination
     */
    getItems(offset?: number, limit?: number): Promise<StorageItem[]>;
    /**
     * Search items by key pattern
     */
    searchItems(pattern: string | RegExp): Promise<StorageItem[]>;
    /**
     * Clean up expired items
     */
    cleanup(): Promise<number>;
    /**
     * Update storage statistics
     */
    private updateStats;
}
//# sourceMappingURL=LocalStorageAdapter.d.ts.map