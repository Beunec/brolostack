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
    priority?: number;
}
export declare class CloudBrolostack extends EnhancedBrolostack {
    readonly cloudAdapters: Map<string, CloudAdapter>;
    readonly cloudSync?: CloudSyncManager;
    readonly cloudConfig?: CloudBrolostackConfig['cloud'];
    constructor(config: CloudBrolostackConfig);
    /**
     * Initialize cloud adapters based on configuration
     */
    private initializeCloudAdapters;
    /**
     * Create cloud adapter instance based on provider
     */
    private createCloudAdapter;
    /**
     * Enable cloud synchronization
     */
    enableCloudSync(): void;
    /**
     * Disable cloud synchronization
     */
    disableCloudSync(): void;
    /**
     * Sync local data to cloud services
     */
    syncToCloud(storeName?: string): Promise<void>;
    /**
     * Restore data from cloud services
     */
    restoreFromCloud(storeName?: string): Promise<void>;
    /**
     * Backup data to cloud services
     */
    backupToCloud(): Promise<void>;
    /**
     * Get cloud adapter by name
     */
    getCloudAdapter(name: string): CloudAdapter | undefined;
    /**
     * Get all available cloud adapters
     */
    getCloudAdapters(): CloudAdapter[];
    /**
     * Check if cloud features are enabled
     */
    isCloudEnabled(): boolean;
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
    };
    /**
     * Override createStore to add cloud sync capabilities
     */
    createStore<T>(name: string, initialState: T): any;
    /**
     * Disconnect from all cloud services
     */
    disconnectFromCloud(): Promise<void>;
    /**
     * Add event listener (delegates to base class event emitter)
     */
    on(event: string, listener: (...args: any[]) => void): void;
    /**
     * Remove event listener (delegates to base class event emitter)
     */
    off(event: string, listener: (...args: any[]) => void): void;
    /**
     * Emit event (delegates to base class event emitter)
     */
    emit(event: string, ...args: any[]): void;
}
export {};
//# sourceMappingURL=CloudBrolostack.d.ts.map