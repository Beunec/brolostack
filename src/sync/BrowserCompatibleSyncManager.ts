/**
 * Browser Compatible Sync Manager
 * Handles sync functionality across different browser versions
 */

import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { browserCompatibility } from '../utils/BrowserCompatibility';

export interface SyncConfig {
  enabled: boolean;
  serverUrl?: string;
  apiKey?: string;
  syncInterval?: number;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
}

export interface SyncEvent {
  type: 'data-synced' | 'conflict-detected' | 'sync-error';
  storeName: string;
  data?: any;
  error?: Error;
}

export class BrowserCompatibleSyncManager {
  private config: SyncConfig;
  private eventEmitter: EventEmitter;
  private logger: Logger;
  private syncInterval?: number | undefined;
  private isOnline: boolean = true; // Default to true for older browsers

  constructor(config: SyncConfig, eventEmitter: EventEmitter, logger: Logger) {
    this.config = {
      syncInterval: 30000, // 30 seconds
      conflictResolution: 'client-wins',
      ...config
    };
    this.eventEmitter = eventEmitter;
    this.logger = logger;

    // Check browser compatibility
    const compatibility = browserCompatibility.generateReport();
    
    if (compatibility.browser.features.navigator) {
      this.isOnline = navigator.onLine;
      this.setupOnlineOfflineListeners();
    } else {
      this.logger.warn('SyncManager: Navigator API not available, using offline mode');
    }
  }

  /**
   * Setup online/offline event listeners with fallbacks
   */
  private setupOnlineOfflineListeners(): void {
    try {
      // Modern browsers
      if (window.addEventListener) {
        window.addEventListener('online', () => {
          this.isOnline = true;
          this.logger.info('SyncManager: Back online, resuming sync');
        });

        window.addEventListener('offline', () => {
          this.isOnline = false;
          this.logger.info('SyncManager: Gone offline, pausing sync');
        });
      } else if ((window as any).attachEvent) {
        // IE fallback
        (window as any).attachEvent('ononline', () => {
          this.isOnline = true;
          this.logger.info('SyncManager: Back online, resuming sync');
        });

        (window as any).attachEvent('onoffline', () => {
          this.isOnline = false;
          this.logger.info('SyncManager: Gone offline, pausing sync');
        });
      }
    } catch (error) {
      this.logger.warn('SyncManager: Could not setup online/offline listeners:', error);
    }
  }

  /**
   * Enable synchronization (optional feature)
   */
  enableSync(serverUrl: string, apiKey: string): void {
    if (!this.config.enabled) {
      this.config.enabled = true;
      this.config.serverUrl = serverUrl;
      this.config.apiKey = apiKey;
      
      this.logger.info('SyncManager: Synchronization enabled');
      this.startSync();
    }
  }

  /**
   * Disable synchronization
   */
  disableSync(): void {
    this.config.enabled = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    this.logger.info('SyncManager: Synchronization disabled');
  }

  /**
   * Sync a specific store with remote server
   */
  async syncStore(storeName: string, localData: any): Promise<any> {
    if (!this.config.enabled || !this.isOnline) {
      return localData;
    }

    try {
      // This would implement actual sync logic
      // For now, it's a placeholder that doesn't break existing functionality
      this.logger.info(`SyncManager: Syncing store ${storeName}`);
      
      // Emit sync event
      this.eventEmitter.emit('sync:data-synced', {
        type: 'data-synced',
        storeName,
        data: localData
      });

      return localData;
    } catch (error) {
      this.logger.error(`SyncManager: Sync failed for ${storeName}:`, error);
      this.eventEmitter.emit('sync:error', {
        type: 'sync-error',
        storeName,
        error: error as Error
      });
      return localData;
    }
  }

  /**
   * Export data for backup
   */
  async exportData(storeName: string): Promise<string> {
    // This would implement data export
    this.logger.info(`SyncManager: Exporting data for ${storeName}`);
    return JSON.stringify({ storeName, timestamp: Date.now() });
  }

  /**
   * Import data from backup
   */
  async importData(storeName: string, _data: string): Promise<boolean> {
    try {
      // This would implement data import
      this.logger.info(`SyncManager: Importing data for ${storeName}`);
      return true;
    } catch (error) {
      this.logger.error(`SyncManager: Import failed for ${storeName}:`, error);
      return false;
    }
  }

  private startSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Use setTimeout for older browsers that don't support setInterval properly
    const startInterval = () => {
      this.syncInterval = window.setInterval(() => {
        if (this.config.enabled && this.isOnline) {
          this.logger.info('SyncManager: Performing periodic sync');
          // This would trigger sync for all stores
        }
      }, this.config.syncInterval);
    };

    // Check if setInterval is available
    if (typeof setInterval === 'function') {
      startInterval();
    } else {
      this.logger.warn('SyncManager: setInterval not available, sync disabled');
    }
  }
}
