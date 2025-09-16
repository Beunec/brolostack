/**
 * Brolostack - Core Framework Class
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 *
 * This is the unified, production-ready core implementation that combines
 * the full-featured capabilities with simplified, reliable functionality.
 */
import { BrolostackConfig, BrolostackApp, BrolostackStore, StorageAdapter, BrolostackAPI, AIAgent } from '../types';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
export declare class Brolostack implements BrolostackApp {
    readonly config: BrolostackConfig;
    readonly storage: StorageAdapter;
    readonly api: BrolostackAPI;
    readonly stores: Map<string, BrolostackStore>;
    readonly ai: {
        agents: Map<string, AIAgent>;
        createAgent(config: any): AIAgent;
        getAgent(id: string): AIAgent | undefined;
        removeAgent(id: string): void;
        runAgent(id: string, input: any): Promise<any>;
        getMemory(): any;
        storeMemory(key: string, value: any, type?: string, importance?: number): Promise<void>;
        clearMemory(): Promise<void>;
        getMemoryStats(): any;
    };
    private readonly eventEmitter;
    private readonly logger;
    private readonly aiManager;
    private isInitialized;
    private startTime;
    constructor(config: BrolostackConfig);
    /**
     * Initialize the Brolostack framework
     */
    initialize(): Promise<void>;
    /**
     * Create a new store
     */
    createStore<T>(name: string, initialState: T): BrolostackStore<T>;
    /**
     * Get an existing store
     */
    getStore<T>(name: string): BrolostackStore<T> | undefined;
    /**
     * Remove a store
     */
    removeStore(name: string): boolean;
    /**
     * Get all store names
     */
    getStoreNames(): string[];
    /**
     * Clear all stores
     */
    clearAllStores(): void;
    /**
     * Export all data from stores and AI memory
     */
    exportData(): Promise<Record<string, any>>;
    /**
     * Import data into stores and AI memory
     */
    importData(data: Record<string, any>): Promise<void>;
    /**
     * Get framework statistics
     */
    getStats(): {
        stores: number;
        aiAgents: number;
        storageSize: number;
        uptime: number;
        version: string;
    };
    /**
     * Persist all stores to storage
     */
    persist(config?: any): void;
    /**
     * Destroy the Brolostack instance
     */
    destroy(): void;
    /**
     * Get the event emitter for custom event handling
     */
    getEventEmitter(): EventEmitter;
    /**
     * Get the logger instance
     */
    getLogger(): Logger;
}
export default Brolostack;
//# sourceMappingURL=Brolostack.d.ts.map