/**
 * Browser Compatible Storage Adapter
 * Provides fallbacks for different browser capabilities
 */

import { LocalStorageAdapter } from './LocalStorageAdapter';
import { browserCompatibility } from '../utils/BrowserCompatibility';

export interface BrowserCompatibleStorageConfig {
  name: string;
  version: number;
  size: number;
  storeName?: string;
  fallbackToMemory?: boolean;
}

export class BrowserCompatibleStorageAdapter extends LocalStorageAdapter {
  private fallbackStorage: Map<string, string>;
  private useFallback: boolean;

  constructor(config: BrowserCompatibleStorageConfig) {
    // Determine storage drivers based on browser support
    const drivers = browserCompatibility.getStorageDriverPriority();
    
    // Create config with browser-appropriate drivers
    const storageConfig = {
      name: config.name,
      version: config.version,
      size: config.size,
      storeName: config.storeName || 'brolostack',
      driver: drivers as any // Type assertion for compatibility
    };

    super(storageConfig);
    
    // Initialize properties after super call
    this.fallbackStorage = new Map();
    this.useFallback = false;
    
    // Check if initialization failed and set fallback
    try {
      // Test if storage is working by calling a public method
      this.getItem('test').catch(() => {
        this.useFallback = true;
        // Storage initialization failed, using fallback
      });
    } catch (error) {
      this.useFallback = true;
      // Failed to initialize with drivers, using fallback
    }
  }

  /**
   * Get item with fallback support
   */
  override async getItem(key: string): Promise<string | null> {
    if (this.useFallback) {
      return this.fallbackStorage.get(key) || null;
    }

    try {
      return await super.getItem(key);
    } catch (error) {
      // Failed to get item, using fallback
      return this.fallbackStorage.get(key) || null;
    }
  }

  /**
   * Set item with fallback support
   */
  override async setItem(key: string, value: string): Promise<void> {
    if (this.useFallback) {
      this.fallbackStorage.set(key, value);
      return;
    }

    try {
      await super.setItem(key, value);
    } catch (error) {
      // Failed to set item, using fallback
      this.fallbackStorage.set(key, value);
    }
  }

  /**
   * Remove item with fallback support
   */
  override async removeItem(key: string): Promise<void> {
    if (this.useFallback) {
      this.fallbackStorage.delete(key);
      return;
    }

    try {
      await super.removeItem(key);
    } catch (error) {
      // Failed to remove item, using fallback
      this.fallbackStorage.delete(key);
    }
  }

  /**
   * Clear all items with fallback support
   */
  override async clear(): Promise<void> {
    if (this.useFallback) {
      this.fallbackStorage.clear();
      return;
    }

    try {
      await super.clear();
    } catch (error) {
      // Failed to clear storage, using fallback
      this.fallbackStorage.clear();
    }
  }

  /**
   * Get all keys with fallback support
   */
  async getKeys(): Promise<string[]> {
    if (this.useFallback) {
      return Array.from(this.fallbackStorage.keys());
    }

    try {
      // Use the base class method if available
      if ('getKeys' in this && typeof (this as any).getKeys === 'function') {
        return await (this as any).getKeys();
      }
      return [];
    } catch (error) {
      // Failed to get keys, using fallback
      return Array.from(this.fallbackStorage.keys());
    }
  }

  /**
   * Get storage size with fallback support
   */
  override getSize(): number {
    if (this.useFallback) {
      let size = 0;
      for (const [key, value] of this.fallbackStorage) {
        size += key.length + value.length;
      }
      return size;
    }

    try {
      return super.getSize();
    } catch (error) {
      // Failed to get size, using fallback
      let size = 0;
      for (const [key, value] of this.fallbackStorage) {
        size += key.length + value.length;
      }
      return size;
    }
  }

  /**
   * Check if using fallback storage
   */
  isUsingFallback(): boolean {
    return this.useFallback;
  }

  /**
   * Get browser compatibility info
   */
  getBrowserInfo() {
    return browserCompatibility.generateReport();
  }
}
