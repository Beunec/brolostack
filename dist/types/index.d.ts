/**
 * Brolostack - Core Type Definitions
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 */
import { ReactNode } from 'react';
export interface BrolostackConfig {
    appName: string;
    version: string;
    storageEngine?: 'localStorage' | 'indexedDB' | 'memory';
    encryption?: boolean;
    compression?: boolean;
    maxStorageSize?: number;
    debug?: boolean;
}
export interface StorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    length(): Promise<number>;
}
export interface BrolostackStore<T = any> {
    getState(): T;
    setState(partial: Partial<T>): void;
    subscribe(listener: (state: T) => void): () => void;
    persist(config?: PersistConfig): void;
    clear(): void;
    reset(): void;
}
export interface PersistConfig {
    name: string;
    partialize?: (state: any) => any;
    version?: number;
    migrate?: (persistedState: any, version: number) => any;
    merge?: (persistedState: any, currentState: any) => any;
}
export interface BrolostackAPI {
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: any): Promise<T>;
    put<T>(endpoint: string, data: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
    patch<T>(endpoint: string, data: any): Promise<T>;
}
export interface AIAgent {
    id: string;
    name: string;
    type: 'llm' | 'multi-agent' | 'custom';
    config: any;
    memory: AIMemory;
    execute(prompt: string, context?: any): Promise<any>;
}
export interface AIMemory {
    store(key: string, value: any): Promise<void>;
    retrieve(key: string): Promise<any>;
    clear(): Promise<void>;
    getAll(): Promise<Record<string, any>>;
}
export interface BrolostackApp {
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
export interface FileSystemNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileSystemNode[];
    parentId?: string;
    createdAt: number;
    updatedAt: number;
    metadata?: Record<string, any>;
}
export interface ProjectConfig {
    name: string;
    description?: string;
    version: string;
    framework: string;
    dependencies: Record<string, string>;
    scripts: Record<string, string>;
    settings: Record<string, any>;
}
export interface UserSession {
    id: string;
    userId: string;
    startTime: number;
    lastActivity: number;
    data: Record<string, any>;
    isActive: boolean;
}
export interface AnalyticsEvent {
    id: string;
    type: string;
    timestamp: number;
    userId: string;
    sessionId: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface BrolostackError extends Error {
    code: string;
    context?: any;
    timestamp: number;
}
export type StorageEventType = 'create' | 'update' | 'delete' | 'clear';
export interface StorageEvent {
    type: StorageEventType;
    key: string;
    value?: any;
    oldValue?: any;
    timestamp: number;
}
export interface BrolostackPlugin {
    name: string;
    version: string;
    install(app: BrolostackApp): void;
    uninstall?(app: BrolostackApp): void;
}
export interface BrolostackMiddleware {
    name: string;
    execute(context: any, next: () => void): void;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type StoreState<T> = T extends BrolostackStore<infer U> ? U : never;
export type BrolostackHook<T> = (selector?: (state: T) => any) => any;
export interface EventEmitter {
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    once(event: string, listener: (...args: any[]) => void): void;
}
export interface BrolostackProviderProps {
    appName: string;
    config?: Partial<BrolostackConfig>;
    children: ReactNode;
}
export interface BrolostackContextValue {
    app: BrolostackApp;
    stores: Map<string, BrolostackStore>;
}
export * from './storage';
export * from './ai';
export * from './api';
//# sourceMappingURL=index.d.ts.map