/**
 * CloudBrolostack - Cloud Integration Extension
 * Extends EnhancedBrolostack with optional cloud service integrations
 * 
 * This is an ADDITIVE feature that doesn't break existing functionality
 * Cloud features are completely optional and opt-in
 */

import { EnhancedBrolostack } from '../core/EnhancedBrolostack';
import { EnhancedBrolostackConfig } from '../core/EnhancedBrolostack';
import { CloudSyncManager } from './CloudSyncManager';

// Inline CloudAdapter interface to avoid import issues
interface CloudAdapter {
  name: string;
  provider: string;
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  sync(data: any): Promise<void>;
  backup(data: any): Promise<void>;
  restore(): Promise<any>;
  syncStore(storeName: string, data: any): Promise<void>;
  restoreStore(storeName: string): Promise<any>;
  getStatus(): any;
  getCapabilities(): any;
}

export interface CloudBrolostackConfig extends EnhancedBrolostackConfig {
  cloud?: {
    enabled: boolean;
    adapters: CloudAdapterConfig[];
    syncStrategy: 'local-first' | 'cloud-first' | 'hybrid';
    conflictResolution: 'client-wins' | 'server-wins' | 'merge';
    autoSync?: boolean;
    syncInterval?: number;
  };
}

export interface CloudAdapterConfig {
  name: string;
  provider: string;
  config: any;
  enabled: boolean;
  priority?: number; // For multi-adapter scenarios
}

export class CloudBrolostack extends EnhancedBrolostack {
  public readonly cloudAdapters: Map<string, CloudAdapter> = new Map();
  public readonly cloudSync?: CloudSyncManager;
  public readonly cloudConfig?: CloudBrolostackConfig['cloud'];

  constructor(config: CloudBrolostackConfig) {
    // Initialize base EnhancedBrolostack (which includes core Brolostack)
    super(config);

    // Store cloud configuration
    this.cloudConfig = config.cloud;

    // Initialize cloud features if enabled
    if (config.cloud?.enabled) {
      this.initializeCloudAdapters(config.cloud);
      
      // Initialize cloud sync manager
      this.cloudSync = new CloudSyncManager(
        config.cloud,
        this.cloudAdapters,
        (this as any).eventEmitter,
        (this as any).logger
      );
    }
  }

  /**
   * Initialize cloud adapters based on configuration
   */
  private async initializeCloudAdapters(cloudConfig: NonNullable<CloudBrolostackConfig['cloud']>): Promise<void> {
    for (const adapterConfig of cloudConfig.adapters) {
      if (adapterConfig.enabled) {
        try {
          // Dynamically import adapter based on provider
          const adapter = await this.createCloudAdapter(adapterConfig);
          this.cloudAdapters.set(adapterConfig.name, adapter);
          
          // Connect to cloud service
          await adapter.connect(adapterConfig.config);
          
          (this as any).logger.info(`Cloud adapter ${adapterConfig.name} (${adapterConfig.provider}) initialized successfully`);
        } catch (error) {
          (this as any).logger.error(`Failed to initialize cloud adapter ${adapterConfig.name}:`, error);
        }
      }
    }
  }

  /**
   * Create cloud adapter instance based on provider
   */
  private async createCloudAdapter(config: CloudAdapterConfig): Promise<CloudAdapter> {
    // This would dynamically import the appropriate adapter
    // For now, we'll create a placeholder that can be extended
    
    switch (config.provider) {
      case 'aws':
        // return new AWSAdapter();
        throw new Error('AWS adapter not yet implemented');
      case 'google-cloud':
        // return new GoogleCloudAdapter();
        throw new Error('Google Cloud adapter not yet implemented');
      case 'cloudflare':
        // return new CloudflareAdapter();
        throw new Error('Cloudflare adapter not yet implemented');
      case 'mongodb':
        // return new MongoDBAdapter();
        throw new Error('MongoDB adapter not yet implemented');
      case 'redis':
        // return new RedisAdapter();
        throw new Error('Redis adapter not yet implemented');
      case 'firebase':
        // return new FirebaseAdapter();
        throw new Error('Firebase adapter not yet implemented');
      default:
        throw new Error(`Unsupported cloud provider: ${config.provider}`);
    }
  }

  /**
   * Enable cloud synchronization
   */
  enableCloudSync(): void {
    if (this.cloudSync) {
      this.cloudSync.enable();
    } else {
      throw new Error('Cloud sync not available. Ensure cloud configuration is enabled.');
    }
  }

  /**
   * Disable cloud synchronization
   */
  disableCloudSync(): void {
    if (this.cloudSync) {
      this.cloudSync.disable();
    }
  }

  /**
   * Sync local data to cloud services
   */
  async syncToCloud(storeName?: string): Promise<void> {
    if (!this.cloudSync) {
      throw new Error('Cloud sync not available. Ensure cloud configuration is enabled.');
    }

    if (storeName) {
      // Sync specific store
      const store = this.stores.get(storeName);
      if (store) {
        await this.cloudSync.syncStore(storeName, store.getState());
      }
    } else {
      // Sync all stores
      await this.cloudSync.syncAllStores();
    }
  }

  /**
   * Restore data from cloud services
   */
  async restoreFromCloud(storeName?: string): Promise<void> {
    if (!this.cloudSync) {
      throw new Error('Cloud sync not available. Ensure cloud configuration is enabled.');
    }

    if (storeName) {
      // Restore specific store
      const data = await this.cloudSync.restoreStore(storeName);
      if (data) {
        const store = this.stores.get(storeName);
        if (store) {
          store.setState(data);
        }
      }
    } else {
      // Restore all stores
      await this.cloudSync.restoreAllStores();
    }
  }

  /**
   * Backup data to cloud services
   */
  async backupToCloud(): Promise<void> {
    if (!this.cloudSync) {
      throw new Error('Cloud sync not available. Ensure cloud configuration is enabled.');
    }

    await this.cloudSync.createBackup();
  }

  /**
   * Get cloud adapter by name
   */
  getCloudAdapter(name: string): CloudAdapter | undefined {
    return this.cloudAdapters.get(name);
  }

  /**
   * Get all available cloud adapters
   */
  getCloudAdapters(): CloudAdapter[] {
    return Array.from(this.cloudAdapters.values());
  }

  /**
   * Check if cloud features are enabled
   */
  isCloudEnabled(): boolean {
    return this.cloudConfig?.enabled === true && this.cloudAdapters.size > 0;
  }

  /**
   * Get cloud status information
   */
  getCloudStatus(): {
    enabled: boolean;
    adapters: Array<{
      name: string;
      provider: string;
      connected: boolean;
    }>;
    syncEnabled: boolean;
  } {
    return {
      enabled: this.isCloudEnabled(),
      adapters: Array.from(this.cloudAdapters.values()).map(adapter => ({
        name: adapter.name,
        provider: adapter.provider,
        connected: adapter.isConnected()
      })),
      syncEnabled: this.cloudSync?.isEnabled() || false
    };
  }

  /**
   * Override createStore to add cloud sync capabilities
   */
  override createStore<T>(name: string, initialState: T): any {
    const store = super.createStore(name, initialState);

    // Add cloud sync capabilities if enabled
    if (this.cloudSync) {
      const originalSetState = store.setState;
      store.setState = (partial: Partial<T>) => {
        originalSetState(partial);
        
        // Auto-sync to cloud if enabled
        if (this.cloudConfig?.autoSync && this.cloudSync) {
          this.cloudSync.syncStore(name, store.getState()).catch((error: any) => {
            (this as any).logger.error(`Auto-sync failed for store ${name}:`, error);
          });
        }
      };
    }

    return store;
  }

  /**
   * Disconnect from all cloud services
   */
  async disconnectFromCloud(): Promise<void> {
    for (const [name, adapter] of this.cloudAdapters) {
      try {
        await adapter.disconnect();
        (this as any).logger.info(`Disconnected from cloud adapter: ${name}`);
      } catch (error) {
        (this as any).logger.error(`Failed to disconnect from cloud adapter ${name}:`, error);
      }
    }
    
    this.cloudAdapters.clear();
  }

  /**
   * Add event listener (delegates to base class event emitter)
   */
  on(event: string, listener: (...args: any[]) => void): void {
    (this as any).eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener (delegates to base class event emitter)
   */
  off(event: string, listener: (...args: any[]) => void): void {
    (this as any).eventEmitter.off(event, listener);
  }

  /**
   * Emit event (delegates to base class event emitter)
   */
  emit(event: string, ...args: any[]): void {
    (this as any).eventEmitter.emit(event, ...args);
  }
}
