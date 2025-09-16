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

export class EnhancedBrolostack extends Brolostack {
  public readonly sync?: SyncManager;
  public readonly enhancedStorage?: EnhancedStorageAdapter;
  
  // Configuration is stored in base class

  constructor(config: EnhancedBrolostackConfig) {
    // Initialize base Brolostack
    super(config);

    // Add optional sync manager
    if (config.sync?.enabled) {
      this.sync = new SyncManager(
        config.sync,
        (this as any).eventEmitter,
        (this as any).logger
      );
    }

    // Add optional enhanced storage
    if (config.backup?.enabled) {
      this.enhancedStorage = new EnhancedStorageAdapter(
        {
          name: config.appName,
          version: parseInt(config.version) || 1,
          size: config.maxStorageSize || 50 * 1024 * 1024
        },
        config.backup
      );
    }
  }

  /**
   * Enable synchronization (optional feature)
   */
  enableSync(serverUrl: string, apiKey: string): void {
    if (this.sync) {
      this.sync.enableSync(serverUrl, apiKey);
    } else {
      (this as any).logger.warn('SyncManager not initialized. Enable sync in config.');
    }
  }

  /**
   * Disable synchronization
   */
  disableSync(): void {
    if (this.sync) {
      this.sync.disableSync();
    }
  }

  /**
   * Create a backup of all data
   */
  async createBackup(): Promise<any> {
    if (this.enhancedStorage) {
      return await this.enhancedStorage.createEnhancedBackup();
    } else {
      (this as any).logger.warn('Enhanced storage not initialized. Enable backup in config.');
      return null;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<boolean> {
    if (this.enhancedStorage) {
      return await this.enhancedStorage.restoreFromBackup(backupId);
    } else {
      (this as any).logger.warn('Enhanced storage not initialized. Enable backup in config.');
      return false;
    }
  }

  /**
   * Export all data as JSON string
   */
  async exportDataAsString(): Promise<string> {
    if (this.enhancedStorage) {
      return await this.enhancedStorage.exportData();
    } else {
      (this as any).logger.warn('Enhanced storage not initialized. Enable backup in config.');
      return '{}';
    }
  }

  /**
   * Import data from JSON string
   */
  async importDataFromString(data: string): Promise<boolean> {
    if (this.enhancedStorage) {
      return await this.enhancedStorage.importData(data);
    } else {
      (this as any).logger.warn('Enhanced storage not initialized. Enable backup in config.');
      return false;
    }
  }

  /**
   * Get available backups
   */
  getBackups(): any[] {
    if (this.enhancedStorage) {
      return this.enhancedStorage.getBackups();
    } else {
      return [];
    }
  }

  /**
   * Override createStore to add sync capabilities
   */
  override createStore<T>(name: string, initialState: T): any {
    const store = super.createStore(name, initialState);
    
    // Add sync capabilities if enabled
    if (this.sync) {
      const originalSetState = store.setState;
      store.setState = (newState: any) => {
        originalSetState.call(store, newState);
        
        // Sync with remote if enabled
        if (this.sync) {
          this.sync.syncStore(name, store.getState());
        }
      };
    }

    return store;
  }
}

// Export as default for easy usage
export default EnhancedBrolostack;
