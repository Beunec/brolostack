import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * Brolostack - Core Type Definitions
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 */

interface BrolostackConfig {
    appName: string;
    version: string;
    storageEngine?: 'localStorage' | 'indexedDB' | 'memory';
    encryption?: boolean;
    compression?: boolean;
    maxStorageSize?: number;
    debug?: boolean;
}
interface StorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    length(): Promise<number>;
}
interface BrolostackStore<T = any> {
    getState(): T;
    setState(partial: Partial<T>): void;
    subscribe(listener: (state: T) => void): () => void;
    persist(config?: PersistConfig): void;
    clear(): void;
    reset(): void;
}
interface PersistConfig {
    name: string;
    partialize?: (state: any) => any;
    version?: number;
    migrate?: (persistedState: any, version: number) => any;
    merge?: (persistedState: any, currentState: any) => any;
}
interface BrolostackAPI {
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: any): Promise<T>;
    put<T>(endpoint: string, data: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
    patch<T>(endpoint: string, data: any): Promise<T>;
}
interface AIAgent {
    id: string;
    name: string;
    type: 'llm' | 'multi-agent' | 'custom';
    config: any;
    memory: AIMemory;
    execute(prompt: string, context?: any): Promise<any>;
}
interface AIMemory {
    store(key: string, value: any): Promise<void>;
    retrieve(key: string): Promise<any>;
    clear(): Promise<void>;
    getAll(): Promise<Record<string, any>>;
}
interface BrolostackApp {
    config: BrolostackConfig;
    storage: StorageAdapter;
    stores: Map<string, BrolostackStore>;
    api: BrolostackAPI;
    ai: {
        agents: Map<string, AIAgent>;
        createAgent(config: any): AIAgent;
        getAgent(id: string): AIAgent | undefined;
        removeAgent(id: string): void;
    };
    createStore<T>(name: string, initialState: T): BrolostackStore<T>;
    destroy(): void;
}
interface BrolostackContextValue {
    app: BrolostackApp;
    stores: Map<string, BrolostackStore>;
}

interface BrolostackProviderProps {
    appName: string;
    config?: Partial<BrolostackConfig>;
    children: ReactNode;
}
declare function BrolostackProvider({ appName, config, children }: BrolostackProviderProps): react_jsx_runtime.JSX.Element;
declare function useBrolostack(): BrolostackContextValue;
declare function useBrolostackStore<T>(storeName: string): BrolostackStore<T>;
declare function useBrolostackState<T>(storeName: string, selector?: (state: T) => any): any;

export { BrolostackProvider, useBrolostack, useBrolostackState, useBrolostackStore };
