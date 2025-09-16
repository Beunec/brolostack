/**
 * Brolostack - Simplified Core Framework
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 */
export interface SimpleBrolostackConfig {
    appName: string;
    version: string;
    debug?: boolean;
}
export interface SimpleStore<T = any> {
    getState(): T;
    setState(partial: Partial<T>): void;
    subscribe(listener: (state: T) => void): () => void;
    persist(name: string): void;
    clear(): void;
}
export declare class SimpleBrolostack {
    config: SimpleBrolostackConfig;
    private stores;
    private isInitialized;
    constructor(config: SimpleBrolostackConfig);
    initialize(): Promise<void>;
    createStore<T>(name: string, initialState: T): SimpleStore<T>;
    getStore<T>(name: string): SimpleStore<T> | undefined;
    removeStore(name: string): boolean;
    getStoreNames(): string[];
    clearAllStores(): void;
    exportData(): Promise<Record<string, any>>;
    importData(data: Record<string, any>): Promise<void>;
    getStats(): {
        stores: number;
        uptime: number;
        version: string;
    };
    destroy(): void;
}
//# sourceMappingURL=SimpleBrolostack.d.ts.map