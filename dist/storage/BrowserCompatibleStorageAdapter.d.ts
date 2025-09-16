/**
 * Browser Compatible Storage Adapter
 * Provides fallbacks for different browser capabilities
 */
import { LocalStorageAdapter } from './LocalStorageAdapter';
export interface BrowserCompatibleStorageConfig {
    name: string;
    version: number;
    size: number;
    storeName?: string;
    fallbackToMemory?: boolean;
}
export declare class BrowserCompatibleStorageAdapter extends LocalStorageAdapter {
    private fallbackStorage;
    private useFallback;
    constructor(config: BrowserCompatibleStorageConfig);
    /**
     * Get item with fallback support
     */
    getItem(key: string): Promise<string | null>;
    /**
     * Set item with fallback support
     */
    setItem(key: string, value: string): Promise<void>;
    /**
     * Remove item with fallback support
     */
    removeItem(key: string): Promise<void>;
    /**
     * Clear all items with fallback support
     */
    clear(): Promise<void>;
    /**
     * Get all keys with fallback support
     */
    getKeys(): Promise<string[]>;
    /**
     * Get storage size with fallback support
     */
    getSize(): number;
    /**
     * Check if using fallback storage
     */
    isUsingFallback(): boolean;
    /**
     * Get browser compatibility info
     */
    getBrowserInfo(): import("../utils/BrowserCompatibility").CompatibilityReport;
}
//# sourceMappingURL=BrowserCompatibleStorageAdapter.d.ts.map