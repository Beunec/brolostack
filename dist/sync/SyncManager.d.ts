/**
 * Brolostack Sync Manager
 * Optional data synchronization layer for multi-user features
 *
 * This is an ADDITIVE feature that doesn't break existing functionality
 */
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
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
export declare class SyncManager {
    private config;
    private eventEmitter;
    private logger;
    private syncInterval?;
    private isOnline;
    constructor(config: SyncConfig, eventEmitter: EventEmitter, logger: Logger);
    /**
     * Enable synchronization (optional feature)
     */
    enableSync(serverUrl: string, apiKey: string): void;
    /**
     * Disable synchronization
     */
    disableSync(): void;
    /**
     * Sync a specific store with remote server
     */
    syncStore(storeName: string, localData: any): Promise<any>;
    /**
     * Export data for backup
     */
    exportData(storeName: string): Promise<string>;
    /**
     * Import data from backup
     */
    importData(storeName: string, _data: string): Promise<boolean>;
    private startSync;
}
//# sourceMappingURL=SyncManager.d.ts.map