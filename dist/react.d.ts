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
    enterprise?: {
        auth?: {
            enabled: boolean;
            provider?: string;
            endpoints?: Record<string, string>;
            tokenStorage?: string;
            autoRefresh?: boolean;
            multiFactorAuth?: any;
            ciam?: boolean;
            hybrid?: boolean;
            tribrid?: boolean;
        };
        ai?: {
            enabled: boolean;
            governance?: boolean;
            reasoning?: boolean;
            tokenControl?: boolean;
        };
        realtime?: {
            enabled: boolean;
            url?: string;
            reconnectInterval?: number;
            maxReconnectAttempts?: number;
            heartbeatInterval?: number;
            compression?: boolean;
        };
        mrm?: {
            enabled: boolean;
            mode?: 'ssr' | 'ssg' | 'hybrid';
            cacheStrategy?: string;
            prerenderRoutes?: string[];
            staticGeneration?: any;
            hydration?: any;
        };
        worker?: {
            enabled: boolean;
            security?: any;
            database?: any;
            realtime?: any;
            templates?: any;
        };
        security?: {
            enabled: boolean;
            encryption?: any;
            blockchain?: any;
            authentication?: any;
            privacy?: any;
            compliance?: any;
        };
        providers?: {
            enabled: boolean;
            ai?: any;
            cloud?: any;
            selectionStrategy?: string;
            healthChecks?: any;
            metrics?: any;
        };
        cloud?: {
            enabled: boolean;
            providers?: any[];
            defaultProvider?: string;
            syncStrategy?: string;
            backup?: any;
        };
    };
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
    initialData?: Record<string, any>;
    ssrMode?: 'ssr' | 'ssg' | 'hybrid' | 'client';
    hydrationStrategy?: 'immediate' | 'lazy' | 'on-demand';
}
declare function BrolostackProvider({ appName, config, children, initialData, ssrMode, hydrationStrategy }: BrolostackProviderProps): react_jsx_runtime.JSX.Element;
declare function useBrolostack(): BrolostackContextValue;
declare function useBrolostackStore<T>(storeName: string): BrolostackStore<T>;
declare function useBrolostackState<T>(storeName: string, selector?: (state: T) => any): any;
/**
 * Hook to access authentication features
 */
declare function useBrolostackAuth(): any;
/**
 * Hook to access real-time features
 */
declare function useBrolostackRealtime(): any;
/**
 * Hook to access MRM (Multi-Rendering Mode) features
 */
declare function useBrolostackMRM(): any;
/**
 * Hook to access security features
 */
declare function useBrolostackSecurity(): any;
/**
 * Hook to access provider management
 */
declare function useBrolostackProviders(): any;
/**
 * Hook to access cloud integration
 */
declare function useBrolostackCloud(): any;
/**
 * Hook to check enterprise feature availability
 */
declare function useBrolostackEnterprise(): {
    isEnabled: any;
    status: any;
    features: {
        auth: boolean;
        realtime: boolean;
        mrm: boolean;
        worker: boolean;
        security: boolean;
        providers: boolean;
        cloud: boolean;
    };
};

export { BrolostackProvider, useBrolostack, useBrolostackAuth, useBrolostackCloud, useBrolostackEnterprise, useBrolostackMRM, useBrolostackProviders, useBrolostackRealtime, useBrolostackSecurity, useBrolostackState, useBrolostackStore };
