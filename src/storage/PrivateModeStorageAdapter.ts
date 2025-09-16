/**
 * Private Mode Storage Adapter
 * Provides storage solutions that work in all browsers' private/incognito modes
 */

import { StorageAdapter } from '../types';
import { browserCompatibility } from '../utils/BrowserCompatibility';

export interface PrivateModeStorageConfig {
  name: string;
  version: number;
  size: number;
  storeName?: string;
  fallbackToMemory?: boolean;
}

export class PrivateModeStorageAdapter implements StorageAdapter {
  private memoryStorage: Map<string, string> = new Map();
  private sessionStorage: Storage | null = null;
  private isPrivateMode: boolean = false;
  private browserInfo: any;

  constructor(_config: PrivateModeStorageConfig) {
    this.browserInfo = browserCompatibility.generateReport();
    this.isPrivateMode = this.browserInfo.browser.features.privateMode;
    
    // Try to use sessionStorage as primary storage in private mode
    try {
      if (typeof sessionStorage !== 'undefined') {
        this.sessionStorage = sessionStorage;
        // Test if sessionStorage works
        this.sessionStorage.setItem('test', 'test');
        this.sessionStorage.removeItem('test');
      }
    } catch (error) {
      // sessionStorage not available, using memory storage
      this.sessionStorage = null;
    }
  }

  /**
   * Get item with private mode support
   */
  async getItem(key: string): Promise<string | null> {
    try {
      // Try sessionStorage first (works in most private modes)
      if (this.sessionStorage) {
        const value = this.sessionStorage.getItem(key);
        if (value !== null) {
          return value;
        }
      }
      
      // Fallback to memory storage
      return this.memoryStorage.get(key) || null;
    } catch (error) {
      // Failed to get item from sessionStorage, using memory fallback
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Set item with private mode support
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Try sessionStorage first
      if (this.sessionStorage) {
        this.sessionStorage.setItem(key, value);
        return;
      }
    } catch (error) {
      // sessionStorage failed, using memory storage
    }
    
    // Fallback to memory storage
    this.memoryStorage.set(key, value);
  }

  /**
   * Remove item with private mode support
   */
  async removeItem(key: string): Promise<void> {
    try {
      // Try sessionStorage first
      if (this.sessionStorage) {
        this.sessionStorage.removeItem(key);
      }
    } catch (error) {
      // sessionStorage remove failed
    }
    
    // Remove from memory storage
    this.memoryStorage.delete(key);
  }

  /**
   * Clear all items with private mode support
   */
  async clear(): Promise<void> {
    try {
      // Try sessionStorage first
      if (this.sessionStorage) {
        this.sessionStorage.clear();
      }
    } catch (error) {
      // sessionStorage clear failed
    }
    
    // Clear memory storage
    this.memoryStorage.clear();
  }

  /**
   * Get all keys with private mode support
   */
  async keys(): Promise<string[]> {
    const keys = new Set<string>();
    
    try {
      // Get keys from sessionStorage
      if (this.sessionStorage) {
        for (let i = 0; i < this.sessionStorage.length; i++) {
          const key = this.sessionStorage.key(i);
          if (key) {
            keys.add(key);
          }
        }
      }
    } catch (error) {
      // Failed to get sessionStorage keys
    }
    
    // Add memory storage keys
    for (const key of this.memoryStorage.keys()) {
      keys.add(key);
    }
    
    return Array.from(keys);
  }

  /**
   * Get storage length with private mode support
   */
  async length(): Promise<number> {
    let count = 0;
    
    try {
      // Count sessionStorage items
      if (this.sessionStorage) {
        count += this.sessionStorage.length;
      }
    } catch (error) {
      // Failed to get sessionStorage length
    }
    
    // Count memory storage items
    count += this.memoryStorage.size;
    
    return count;
  }

  /**
   * Check if in private mode
   */
  isInPrivateMode(): boolean {
    return this.isPrivateMode;
  }

  /**
   * Get browser info
   */
  getBrowserInfo() {
    return this.browserInfo;
  }

  /**
   * Get storage method being used
   */
  getStorageMethod(): string {
    if (this.sessionStorage) {
      return 'sessionStorage';
    }
    return 'memory';
  }

  /**
   * Export data for backup (works in private mode)
   */
  async exportData(): Promise<string> {
    const data: Record<string, string> = {};
    
    // Export from sessionStorage
    try {
      if (this.sessionStorage) {
        for (let i = 0; i < this.sessionStorage.length; i++) {
          const key = this.sessionStorage.key(i);
          if (key) {
            const value = this.sessionStorage.getItem(key);
            if (value) {
              data[key] = value;
            }
          }
        }
      }
    } catch (error) {
      // Failed to export from sessionStorage
    }
    
    // Export from memory storage
    for (const [key, value] of this.memoryStorage) {
      data[key] = value;
    }
    
    return JSON.stringify({
      data,
      timestamp: Date.now(),
      browser: this.browserInfo.browser.name,
      privateMode: this.isPrivateMode,
      storageMethod: this.getStorageMethod()
    });
  }

  /**
   * Import data from backup (works in private mode)
   */
  async importData(dataString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(dataString);
      const data = parsed.data || {};
      
      // Import to sessionStorage
      if (this.sessionStorage) {
        for (const [key, value] of Object.entries(data)) {
          try {
            this.sessionStorage.setItem(key, value as string);
          } catch (error) {
            // If sessionStorage fails, use memory storage
            this.memoryStorage.set(key, value as string);
          }
        }
      } else {
        // Import to memory storage
        for (const [key, value] of Object.entries(data)) {
          this.memoryStorage.set(key, value as string);
        }
      }
      
      return true;
    } catch (error) {
      // Failed to import data
      return false;
    }
  }
}
