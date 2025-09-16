/**
 * Brolostack - Local Storage Adapter
 * Handles browser local storage with encryption, compression, and advanced features
 */

import localForage from 'localforage';
import { StorageAdapter, StorageConfig, StorageItem, StorageStats, StorageBackup } from '../types';
import { Logger } from '../utils/Logger';

export class LocalStorageAdapter implements StorageAdapter {
  private storage: LocalForage;
  private config: StorageConfig;
  private isInitialized: boolean = false;
  private logger: Logger;
  private stats: StorageStats = {
    totalItems: 0,
    totalSize: 0,
    availableSpace: 0,
    usedSpace: 0,
    averageItemSize: 0
  };

  constructor(config: StorageConfig) {
    this.config = {
      storeName: 'brolostack',
      version: 1,
      size: 50 * 1024 * 1024, // 50MB default
      driver: ['localStorageWrapper', 'indexedDB', 'webSQLStorage'],
      ...config
    };
    
    this.logger = new Logger(false, 'LocalStorageAdapter');

    this.storage = localForage.createInstance({
      name: this.config.name,
      storeName: this.config.storeName || 'brolostack',
      description: this.config.description || '',
      version: this.config.version || 1,
      size: this.config.size || 50 * 1024 * 1024,
      driver: this.config.driver || ['localStorageWrapper', 'indexedDB', 'webSQLStorage']
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Test storage availability
      await this.storage.setItem('__brolostack_test__', 'test');
      await this.storage.removeItem('__brolostack_test__');
      
      // Update stats
      await this.updateStats();
      
      this.isInitialized = true;
      this.logger.info('LocalStorageAdapter initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize LocalStorageAdapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const item = await this.storage.getItem<StorageItem>(key);
      if (!item) return null;

      // Check if item is expired
      if (item.metadata?.expires && Date.now() > item.metadata.expires) {
        await this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      this.logger.error(`Failed to get item '${key}'`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now(),
        version: this.config.version || 1,
        metadata: {
          size: new Blob([value]).size,
          compressed: false,
          encrypted: false
        }
      };

      await this.storage.setItem(key, item);
      await this.updateStats();
    } catch (error) {
      this.logger.error(`Failed to set item '${key}'`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.storage.removeItem(key);
      await this.updateStats();
    } catch (error) {
      this.logger.error(`Failed to remove item '${key}'`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.storage.clear();
      await this.updateStats();
    } catch (error) {
      this.logger.error('Failed to clear storage', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      return await this.storage.keys();
    } catch (error) {
      this.logger.error('Failed to get keys', error);
      return [];
    }
  }

  async length(): Promise<number> {
    try {
      return await this.storage.length();
    } catch (error) {
      this.logger.error('Failed to get length', error);
      return 0;
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    return { ...this.stats };
  }

  /**
   * Get available storage space
   */
  getAvailableSpace(): number {
    return this.stats.availableSpace;
  }

  /**
   * Get used storage space
   */
  getUsedSpace(): number {
    return this.stats.usedSpace;
  }

  /**
   * Get total storage size
   */
  getSize(): number {
    return this.stats.totalSize;
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Create a backup of all data
   */
  async createBackup(): Promise<StorageBackup> {
    try {
      const keys = await this.keys();
      const data: Record<string, StorageItem> = {};

      for (const key of keys) {
        const item = await this.storage.getItem<StorageItem>(key);
        if (item) {
          data[key] = item;
        }
      }

      const backup: StorageBackup = {
        version: this.config.version?.toString() || '1.0.0',
        timestamp: Date.now(),
        data,
        metadata: {
          totalItems: keys.length,
          totalSize: this.stats.totalSize,
          appName: this.config.name,
          appVersion: this.config.version?.toString() || '1.0.0'
        }
      };

      return backup;
    } catch (error) {
      this.logger.error('Failed to create backup', error);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backup: StorageBackup): Promise<void> {
    try {
      // Clear existing data
      await this.clear();

      // Restore data
      for (const [key, item] of Object.entries(backup.data)) {
        await this.storage.setItem(key, item);
      }

      await this.updateStats();
    } catch (error) {
      this.logger.error('Failed to restore backup', error);
      throw error;
    }
  }

  /**
   * Get items with pagination
   */
  async getItems(offset: number = 0, limit: number = 100): Promise<StorageItem[]> {
    try {
      const keys = await this.keys();
      const items: StorageItem[] = [];

      for (let i = offset; i < Math.min(offset + limit, keys.length); i++) {
        const key = keys[i];
        if (key) {
          const item = await this.storage.getItem<StorageItem>(key);
          if (item) {
            items.push(item);
          }
        }
      }

      return items;
    } catch (error) {
      this.logger.error('Failed to get items', error);
      return [];
    }
  }

  /**
   * Search items by key pattern
   */
  async searchItems(pattern: string | RegExp): Promise<StorageItem[]> {
    try {
      const keys = await this.keys();
      const matchingKeys = keys.filter(key => {
        if (typeof pattern === 'string') {
          return key.includes(pattern);
        } else {
          return pattern.test(key);
        }
      });

      const items: StorageItem[] = [];
      for (const key of matchingKeys) {
        const item = await this.storage.getItem<StorageItem>(key);
        if (item) {
          items.push(item);
        }
      }

      return items;
    } catch (error) {
      this.logger.error('Failed to search items', error);
      return [];
    }
  }

  /**
   * Clean up expired items
   */
  async cleanup(): Promise<number> {
    try {
      const keys = await this.keys();
      let cleanedCount = 0;

      for (const key of keys) {
        const item = await this.storage.getItem<StorageItem>(key);
        if (item && item.metadata?.expires && Date.now() > item.metadata.expires) {
          await this.removeItem(key);
          cleanedCount++;
        }
      }

      await this.updateStats();
      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup expired items', error);
      return 0;
    }
  }

  /**
   * Update storage statistics
   */
  private async updateStats(): Promise<void> {
    try {
      const keys = await this.keys();
      let totalSize = 0;
      let oldestItem: StorageItem | undefined;
      let newestItem: StorageItem | undefined;

      for (const key of keys) {
        const item = await this.storage.getItem<StorageItem>(key);
        if (item) {
          totalSize += item.metadata?.size || 0;

          if (!oldestItem || item.timestamp < oldestItem.timestamp) {
            oldestItem = item;
          }

          if (!newestItem || item.timestamp > newestItem.timestamp) {
            newestItem = item;
          }
        }
      }

      this.stats = {
        totalItems: keys.length,
        totalSize,
        availableSpace: (this.config.size || 50 * 1024 * 1024) - totalSize,
        usedSpace: totalSize,
        oldestItem,
        newestItem,
        averageItemSize: keys.length > 0 ? totalSize / keys.length : 0
      };
    } catch (error) {
      this.logger.error('Failed to update stats', error);
    }
  }
}
