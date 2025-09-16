/**
 * Private Mode Storage Adapter
 * Provides storage solutions that work in all browsers' private/incognito modes
 */
import { StorageAdapter } from '../types';
export interface PrivateModeStorageConfig {
    name: string;
    version: number;
    size: number;
    storeName?: string;
    fallbackToMemory?: boolean;
}
export declare class PrivateModeStorageAdapter implements StorageAdapter {
    private memoryStorage;
    private sessionStorage;
    private isPrivateMode;
    private browserInfo;
    constructor(_config: PrivateModeStorageConfig);
    /**
     * Get item with private mode support
     */
    getItem(key: string): Promise<string | null>;
    /**
     * Set item with private mode support
     */
    setItem(key: string, value: string): Promise<void>;
    /**
     * Remove item with private mode support
     */
    removeItem(key: string): Promise<void>;
    /**
     * Clear all items with private mode support
     */
    clear(): Promise<void>;
    /**
     * Get all keys with private mode support
     */
    keys(): Promise<string[]>;
    /**
     * Get storage length with private mode support
     */
    length(): Promise<number>;
    /**
     * Check if in private mode
     */
    isInPrivateMode(): boolean;
    /**
     * Get browser info
     */
    getBrowserInfo(): any;
    /**
     * Get storage method being used
     */
    getStorageMethod(): string;
    /**
     * Export data for backup (works in private mode)
     */
    exportData(): Promise<string>;
    /**
     * Import data from backup (works in private mode)
     */
    importData(dataString: string): Promise<boolean>;
}
//# sourceMappingURL=PrivateModeStorageAdapter.d.ts.map