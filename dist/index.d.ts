import { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Brolostack - Storage Type Definitions
 */
interface StorageConfig {
    name: string;
    storeName?: string;
    description?: string;
    size?: number;
    version?: number;
    driver?: StorageDriver[];
}
type StorageDriver = 'localStorageWrapper' | 'indexedDB' | 'webSQLStorage' | 'localforage';
interface StorageItem<T = any> {
    key: string;
    value: T;
    timestamp: number;
    version: number;
    metadata?: {
        size: number;
        compressed?: boolean;
        encrypted?: boolean;
        checksum?: string;
        expires?: number;
    };
}
interface StorageQuery {
    key?: string | RegExp;
    value?: any;
    timestamp?: {
        from?: number;
        to?: number;
    };
    version?: number;
    limit?: number;
    offset?: number;
    sortBy?: 'key' | 'timestamp' | 'version';
    sortOrder?: 'asc' | 'desc';
}
interface StorageStats {
    totalItems: number;
    totalSize: number;
    availableSpace: number;
    usedSpace: number;
    oldestItem?: StorageItem | undefined;
    newestItem?: StorageItem | undefined;
    averageItemSize: number;
}
interface StorageBackup {
    version: string;
    timestamp: number;
    data: Record<string, StorageItem>;
    metadata: {
        totalItems: number;
        totalSize: number;
        appName: string;
        appVersion: string;
    };
}
interface StorageMigration {
    fromVersion: number;
    toVersion: number;
    migrate: (data: any) => any;
    rollback?: (data: any) => any;
}
interface StorageEncryption {
    algorithm: string;
    key: string | CryptoKey;
    iv?: Uint8Array;
}
interface StorageCompression {
    algorithm: 'gzip' | 'deflate' | 'lz4';
    level?: number;
}
interface StorageTransaction {
    id: string;
    operations: StorageOperation[];
    status: 'pending' | 'committed' | 'rolled-back';
    timestamp: number;
}
interface StorageOperation {
    type: 'get' | 'set' | 'delete' | 'clear';
    key: string;
    value?: any;
    oldValue?: any;
}
interface StorageIndex {
    name: string;
    keyPath: string | string[];
    unique?: boolean;
    multiEntry?: boolean;
}
interface StorageSchema {
    version: number;
    stores: StorageStoreSchema[];
    migrations?: StorageMigration[];
}
interface StorageStoreSchema {
    name: string;
    keyPath: string;
    autoIncrement?: boolean;
    indexes?: StorageIndex[];
}
interface StorageOptions {
    encryption?: StorageEncryption;
    compression?: StorageCompression;
    backup?: {
        enabled: boolean;
        interval: number;
        maxBackups: number;
    };
    sync?: {
        enabled: boolean;
        conflictResolution: 'last-write-wins' | 'merge' | 'custom';
        customResolver?: (local: any, remote: any) => any;
    };
    validation?: {
        enabled: boolean;
        schema?: any;
        validator?: (value: any) => boolean;
    };
}

/**
 * Brolostack - AI Type Definitions
 */
interface AIConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    model: string;
    apiKey?: string;
    baseURL?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    timeout?: number;
    retries?: number;
}
interface AIMessage {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    name?: string;
    function_call?: {
        name: string;
        arguments: string;
    };
    tool_calls?: AIToolCall[];
    tool_call_id?: string;
}
interface AIToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
interface AITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: any;
    };
}
interface AIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: AIChoice[];
    usage: AIUsage;
    system_fingerprint?: string;
}
interface AIChoice {
    index: number;
    message: AIMessage;
    finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'null';
    logprobs?: any;
}
interface AIUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
interface AIAgentConfig {
    id: string;
    name: string;
    description?: string;
    type: 'llm' | 'multi-agent' | 'custom';
    config: AIConfig;
    systemPrompt?: string;
    tools?: AITool[];
    memory?: {
        enabled: boolean;
        maxSize: number;
        strategy: 'fifo' | 'lru' | 'importance';
    };
    guardrails?: AIGuardrails;
    capabilities: AICapabilities;
}
interface AIGuardrails {
    maxTokens: number;
    maxRequests: number;
    allowedDomains: string[];
    forbiddenPatterns: string[];
    contentFilter: boolean;
    rateLimit: {
        requests: number;
        window: number;
    };
}
interface AICapabilities {
    textGeneration: boolean;
    codeGeneration: boolean;
    dataAnalysis: boolean;
    fileOperations: boolean;
    webSearch: boolean;
    imageGeneration: boolean;
    audioProcessing: boolean;
    customFunctions: boolean;
}
interface AIMemoryEntry {
    id: string;
    timestamp: number;
    type: 'conversation' | 'context' | 'knowledge' | 'preference';
    content: any;
    importance: number;
    tags: string[];
    metadata?: Record<string, any>;
}
interface AIAgent$1 {
    id: string;
    name: string;
    type: 'llm' | 'multi-agent' | 'custom';
    config: AIAgentConfig;
    memory: AIMemory$1;
    state: AIAgentState;
    execute(prompt: string, context?: any): Promise<AIResponse>;
    addTool(tool: AITool): void;
    removeTool(toolName: string): void;
    clearMemory(): void;
    getMemoryStats(): AIMemoryStats;
}
interface AIAgentState {
    isActive: boolean;
    isProcessing: boolean;
    lastActivity: number;
    totalRequests: number;
    totalTokens: number;
    errors: AIError[];
}
interface AIError {
    id: string;
    timestamp: number;
    type: 'api' | 'validation' | 'rate-limit' | 'timeout' | 'unknown';
    message: string;
    context?: any;
    retryable: boolean;
}
interface AIMemory$1 {
    entries: Map<string, AIMemoryEntry>;
    maxSize: number;
    strategy: 'fifo' | 'lru' | 'importance';
    store(key: string, value: any, type?: string, importance?: number): Promise<void>;
    retrieve(key: string): Promise<AIMemoryEntry | undefined>;
    search(query: string, type?: string, limit?: number): Promise<AIMemoryEntry[]>;
    clear(): Promise<void>;
    getStats(): AIMemoryStats;
    cleanup(): Promise<void>;
}
interface AIMemoryStats {
    totalEntries: number;
    totalSize: number;
    averageImportance: number;
    oldestEntry?: AIMemoryEntry | undefined;
    newestEntry?: AIMemoryEntry | undefined;
    entriesByType: Record<string, number>;
}
interface AIMultiAgentSystem {
    id: string;
    name: string;
    agents: Map<string, AIAgent$1>;
    coordinator: AICoordinator;
    workflow: AIWorkflow;
    state: AIMultiAgentState;
    addAgent(agent: AIAgent$1): void;
    removeAgent(agentId: string): void;
    executeTask(task: AITask): Promise<AIResult>;
    getSystemStats(): AIMultiAgentStats;
}
interface AICoordinator {
    id: string;
    name: string;
    strategy: 'sequential' | 'parallel' | 'hierarchical' | 'democratic';
    rules: AICoordinationRule[];
    execute(agents: AIAgent$1[], task: AITask): Promise<AIResult>;
}
interface AICoordinationRule {
    id: string;
    condition: (context: any) => boolean;
    action: (context: any) => any;
    priority: number;
}
interface AIWorkflow {
    id: string;
    name: string;
    steps: AIWorkflowStep[];
    conditions: AIWorkflowCondition[];
    execute(context: any): Promise<AIResult>;
}
interface AIWorkflowStep {
    id: string;
    name: string;
    agentId: string;
    input: any;
    output?: any;
    condition?: (context: any) => boolean;
    timeout?: number;
    retries?: number;
}
interface AIWorkflowCondition {
    id: string;
    condition: (context: any) => boolean;
    action: 'continue' | 'skip' | 'stop' | 'retry';
    targetStep?: string;
}
interface AITask {
    id: string;
    type: string;
    description: string;
    input: any;
    priority: number;
    deadline?: number;
    requirements: AITaskRequirement[];
    context?: any;
}
interface AITaskRequirement {
    type: 'capability' | 'resource' | 'constraint';
    value: any;
    operator: 'equals' | 'contains' | 'greater-than' | 'less-than';
}
interface AIResult {
    id: string;
    taskId: string;
    success: boolean;
    output?: any;
    error?: AIError;
    metadata: {
        executionTime: number;
        tokensUsed: number;
        agentsUsed: string[];
        stepsCompleted: string[];
    };
}
interface AIMultiAgentState {
    isActive: boolean;
    currentTask?: AITask;
    activeAgents: string[];
    completedTasks: string[];
    failedTasks: string[];
    totalExecutionTime: number;
    lastActivity: number;
}
interface AIMultiAgentStats {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageExecutionTime: number;
    totalTokensUsed: number;
    systemUptime: number;
}

/**
 * Brolostack - API Type Definitions
 */
interface APIRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
    timeout?: number;
    retries?: number;
}
interface APIResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: APIRequest;
    request?: any;
}
interface APIError {
    message: string;
    code: string;
    status?: number;
    response?: APIResponse;
    request?: APIRequest;
    timestamp: number;
}
interface APIClient {
    get<T>(endpoint: string, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    post<T>(endpoint: string, data?: any, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    put<T>(endpoint: string, data?: any, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    delete<T>(endpoint: string, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    patch<T>(endpoint: string, data?: any, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
}
interface APIMiddleware {
    name: string;
    request?: (config: APIRequest) => APIRequest | Promise<APIRequest>;
    response?: (response: APIResponse) => APIResponse | Promise<APIResponse>;
    error?: (error: APIError) => APIError | Promise<APIError>;
}
interface APIConfig {
    baseURL?: string;
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
    middleware?: APIMiddleware[];
    interceptors?: {
        request?: (config: APIRequest) => APIRequest | Promise<APIRequest>;
        response?: (response: APIResponse) => APIResponse | Promise<APIResponse>;
        error?: (error: APIError) => APIError | Promise<APIError>;
    };
}
interface LocalAPIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    handler: (request: LocalAPIRequest) => Promise<LocalAPIResponse>;
    middleware?: APIMiddleware[];
    validation?: {
        body?: any;
        query?: any;
        params?: any;
    };
}
interface LocalAPIRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: any;
    query: Record<string, string>;
    params: Record<string, string>;
    timestamp: number;
}
interface LocalAPIResponse {
    data?: any;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    error?: APIError;
}
interface LocalAPIRouter {
    routes: Map<string, LocalAPIEndpoint>;
    middleware: APIMiddleware[];
    register(endpoint: LocalAPIEndpoint): void;
    unregister(path: string, method: string): void;
    handle(request: LocalAPIRequest): Promise<LocalAPIResponse>;
    use(middleware: APIMiddleware): void;
}
interface APICache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    keys(): Promise<string[]>;
}
interface APIRateLimit {
    window: number;
    maxRequests: number;
    current: number;
    resetTime: number;
    check(): boolean;
    increment(): void;
    reset(): void;
    getRemaining(): number;
    getResetTime(): number;
}
interface APIMonitoring {
    requests: APIMetric[];
    errors: APIMetric[];
    responseTimes: APIMetric[];
    recordRequest(request: APIRequest, response: APIResponse, duration: number): void;
    recordError(error: APIError, duration: number): void;
    getStats(): APIMonitoringStats;
    clear(): void;
}
interface APIMetric {
    timestamp: number;
    value: number;
    metadata?: Record<string, any>;
}
interface APIMonitoringStats {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    topEndpoints: Array<{
        endpoint: string;
        count: number;
        averageTime: number;
    }>;
    errorTypes: Record<string, number>;
}
interface APIBatchRequest {
    id: string;
    requests: APIRequest[];
    options?: {
        concurrency?: number;
        stopOnError?: boolean;
        retryOnError?: boolean;
    };
}
interface APIBatchResponse {
    id: string;
    responses: Array<{
        request: APIRequest;
        response?: APIResponse;
        error?: APIError;
    }>;
    success: boolean;
    totalTime: number;
}
interface APISocket {
    url: string;
    protocols?: string[];
    options?: {
        reconnect?: boolean;
        maxReconnectAttempts?: number;
        reconnectInterval?: number;
    };
    connect(): Promise<void>;
    disconnect(): void;
    send(data: any): void;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}
interface APISubscription {
    id: string;
    endpoint: string;
    callback: (data: any) => void;
    options?: {
        autoReconnect?: boolean;
        heartbeat?: number;
    };
    start(): Promise<void>;
    stop(): void;
    isActive(): boolean;
}
interface APIGraphQLRequest {
    query: string;
    variables?: Record<string, any>;
    operationName?: string;
}
interface APIGraphQLResponse {
    data?: any;
    errors?: Array<{
        message: string;
        locations?: Array<{
            line: number;
            column: number;
        }>;
        path?: string[];
    }>;
    extensions?: Record<string, any>;
}
interface APIGraphQLClient {
    query(request: APIGraphQLRequest): Promise<APIGraphQLResponse>;
    mutate(request: APIGraphQLRequest): Promise<APIGraphQLResponse>;
    subscribe(request: APIGraphQLRequest): APISubscription;
}

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
interface FileSystemNode {
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
interface ProjectConfig {
    name: string;
    description?: string;
    version: string;
    framework: string;
    dependencies: Record<string, string>;
    scripts: Record<string, string>;
    settings: Record<string, any>;
}
interface UserSession {
    id: string;
    userId: string;
    startTime: number;
    lastActivity: number;
    data: Record<string, any>;
    isActive: boolean;
}
interface AnalyticsEvent {
    id: string;
    type: string;
    timestamp: number;
    userId: string;
    sessionId: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
}
interface BrolostackError extends Error {
    code: string;
    context?: any;
    timestamp: number;
}
type StorageEventType = 'create' | 'update' | 'delete' | 'clear';
interface StorageEvent {
    type: StorageEventType;
    key: string;
    value?: any;
    oldValue?: any;
    timestamp: number;
}
interface BrolostackPlugin {
    name: string;
    version: string;
    install(app: BrolostackApp): void;
    uninstall?(app: BrolostackApp): void;
}
interface BrolostackMiddleware {
    name: string;
    execute(context: any, next: () => void): void;
}
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type StoreState<T> = T extends BrolostackStore<infer U> ? U : never;
type BrolostackHook<T> = (selector?: (state: T) => any) => any;
interface BrolostackProviderProps$1 {
    appName: string;
    config?: Partial<BrolostackConfig>;
    children: ReactNode;
}
interface BrolostackContextValue {
    app: BrolostackApp;
    stores: Map<string, BrolostackStore>;
}

/**
 * Brolostack - Event Emitter Utility
 * Simple event emitter for the framework
 */
declare class EventEmitter {
    private events;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    once(event: string, listener: (...args: any[]) => void): void;
    removeAllListeners(event?: string): void;
    listenerCount(event: string): number;
    eventNames(): string[];
}

/**
 * Brolostack - Logger Utility
 * Simple logging utility for the framework
 */
declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
declare class Logger {
    private level;
    private prefix;
    constructor(debug?: boolean, prefix?: string);
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    setLevel(level: LogLevel): void;
    setPrefix(prefix: string): void;
}

/**
 * Brolostack - Core Framework Class
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 *
 * This is the unified, production-ready core implementation that combines
 * the full-featured capabilities with simplified, reliable functionality.
 */

declare class Brolostack implements BrolostackApp {
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

/**
 * Brolostack Sync Manager
 * Optional data synchronization layer for multi-user features
 *
 * This is an ADDITIVE feature that doesn't break existing functionality
 */

interface SyncConfig$1 {
    enabled: boolean;
    serverUrl?: string;
    apiKey?: string;
    syncInterval?: number;
    conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
}
declare class SyncManager {
    private config;
    private eventEmitter;
    private logger;
    private syncInterval?;
    private isOnline;
    constructor(config: SyncConfig$1, eventEmitter: EventEmitter, logger: Logger);
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

/**
 * Brolostack - Local Storage Adapter
 * Handles browser local storage with encryption, compression, and advanced features
 */

declare class LocalStorageAdapter implements StorageAdapter {
    private storage;
    private config;
    private isInitialized;
    private logger;
    private stats;
    constructor(config: StorageConfig);
    initialize(): Promise<void>;
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    length(): Promise<number>;
    /**
     * Get storage statistics
     */
    getStats(): StorageStats;
    /**
     * Get available storage space
     */
    getAvailableSpace(): number;
    /**
     * Get used storage space
     */
    getUsedSpace(): number;
    /**
     * Get total storage size
     */
    getSize(): number;
    /**
     * Check if storage is available
     */
    isAvailable(): boolean;
    /**
     * Create a backup of all data
     */
    createBackup(): Promise<StorageBackup>;
    /**
     * Restore from backup
     */
    restoreBackup(backup: StorageBackup): Promise<void>;
    /**
     * Get items with pagination
     */
    getItems(offset?: number, limit?: number): Promise<StorageItem[]>;
    /**
     * Search items by key pattern
     */
    searchItems(pattern: string | RegExp): Promise<StorageItem[]>;
    /**
     * Clean up expired items
     */
    cleanup(): Promise<number>;
    /**
     * Update storage statistics
     */
    private updateStats;
}

/**
 * Enhanced Storage Adapter
 * Extends LocalStorageAdapter with backup and recovery features
 *
 * This is an ADDITIVE feature that doesn't break existing functionality
 */

interface BackupConfig {
    enabled: boolean;
    autoBackup: boolean;
    backupInterval?: number;
    maxBackups?: number;
    cloudBackup?: {
        enabled: boolean;
        provider: 'google-drive' | 'dropbox' | 'custom';
        apiKey?: string;
    };
}
interface BackupInfo {
    id: string;
    timestamp: number;
    size: number;
    storeNames: string[];
    checksum: string;
}
declare class EnhancedStorageAdapter extends LocalStorageAdapter {
    private backupConfig;
    private backups;
    constructor(config: any, backupConfig?: BackupConfig);
    /**
     * Create a backup of all data
     */
    createEnhancedBackup(): Promise<BackupInfo>;
    /**
     * Restore from backup
     */
    restoreFromBackup(backupId: string): Promise<boolean>;
    /**
     * Export data for manual backup
     */
    exportData(): Promise<string>;
    /**
     * Import data from manual backup
     */
    importData(data: string): Promise<boolean>;
    /**
     * Get list of available backups
     */
    getBackups(): BackupInfo[];
    /**
     * Delete a backup
     */
    deleteBackup(backupId: string): boolean;
    private startAutoBackup;
    private generateChecksum;
}

/**
 * Enhanced Brolostack - Extended Core Framework
 * Adds optional synchronization and backup features
 *
 * This extends the existing Brolostack without breaking changes
 */

interface EnhancedBrolostackConfig extends BrolostackConfig {
    sync?: SyncConfig$1;
    backup?: BackupConfig;
}
declare class EnhancedBrolostack extends Brolostack {
    readonly sync?: SyncManager;
    readonly enhancedStorage?: EnhancedStorageAdapter;
    constructor(config: EnhancedBrolostackConfig);
    /**
     * Enable synchronization (optional feature)
     */
    enableSync(serverUrl: string, apiKey: string): void;
    /**
     * Disable synchronization
     */
    disableSync(): void;
    /**
     * Create a backup of all data
     */
    createBackup(): Promise<any>;
    /**
     * Restore from backup
     */
    restoreFromBackup(backupId: string): Promise<boolean>;
    /**
     * Export all data as JSON string
     */
    exportDataAsString(): Promise<string>;
    /**
     * Import data from JSON string
     */
    importDataFromString(data: string): Promise<boolean>;
    /**
     * Get available backups
     */
    getBackups(): any[];
    /**
     * Override createStore to add sync capabilities
     */
    createStore<T>(name: string, initialState: T): any;
}

/**
 * Cloud Integration Types
 * Defines interfaces for cloud service integrations
 */
interface CloudAdapter$1 {
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
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
}
interface CloudAdapterStatus {
    connected: boolean;
    lastSync?: Date;
    lastBackup?: Date;
    errorCount: number;
    lastError?: string;
}
interface CloudAdapterCapabilities {
    supportsSync: boolean;
    supportsBackup: boolean;
    supportsRestore: boolean;
    supportsRealTime: boolean;
    maxDataSize?: number;
    supportedFormats: string[];
}
interface CloudSyncManager$1 {
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    syncAllStores(): Promise<void>;
    restoreAllStores(): Promise<void>;
    createBackup(): Promise<void>;
    restoreBackup(backupId: string): Promise<void>;
    listBackups(): Promise<CloudBackup[]>;
    resolveConflict(storeName: string, localData: any, cloudData: any): Promise<any>;
}
interface CloudBackup {
    id: string;
    timestamp: Date;
    size: number;
    stores: string[];
    checksum: string;
}
interface CloudSyncEvent {
    type: 'sync-started' | 'sync-completed' | 'sync-failed' | 'conflict-detected';
    storeName?: string;
    data?: any;
    error?: Error;
    timestamp: Date;
}
interface AWSConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName?: string;
    tableName?: string;
}
interface GoogleCloudConfig {
    projectId: string;
    serviceAccountKey: string;
    bucketName?: string;
    collectionName?: string;
}
interface CloudflareConfig {
    accountId: string;
    apiToken: string;
    databaseId?: string;
    bucketName?: string;
}
interface MongoDBConfig {
    connectionString: string;
    databaseName: string;
    collectionName?: string;
}
interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    database?: number;
}
interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}

/**
 * Cloud Sync Manager
 * Manages synchronization between local Brolostack stores and cloud services
 */

interface CloudSyncConfig {
    enabled: boolean;
    adapters: any[];
    syncStrategy: 'local-first' | 'cloud-first' | 'hybrid';
    conflictResolution: 'client-wins' | 'server-wins' | 'merge';
    autoSync?: boolean;
    syncInterval?: number;
}
declare class CloudSyncManager implements CloudSyncManager$1 {
    private config;
    private adapters;
    private eventEmitter;
    private logger;
    private enabled;
    private syncInterval?;
    constructor(config: CloudSyncConfig, adapters: Map<string, CloudAdapter$1>, eventEmitter: EventEmitter, logger: Logger);
    /**
     * Enable cloud synchronization
     */
    enable(): void;
    /**
     * Disable cloud synchronization
     */
    disable(): void;
    /**
     * Check if sync is enabled
     */
    isEnabled(): boolean;
    /**
     * Sync a specific store to cloud
     */
    syncStore(storeName: string, data: any): Promise<void>;
    /**
     * Restore a specific store from cloud
     */
    restoreStore(storeName: string): Promise<any>;
    /**
     * Sync all stores to cloud
     */
    syncAllStores(): Promise<void>;
    /**
     * Restore all stores from cloud
     */
    restoreAllStores(): Promise<void>;
    /**
     * Create a backup of all data
     */
    createBackup(): Promise<void>;
    /**
     * Restore from a specific backup
     */
    restoreBackup(backupId: string): Promise<void>;
    /**
     * List available backups
     */
    listBackups(): Promise<CloudBackup[]>;
    /**
     * Resolve conflicts between local and cloud data
     */
    resolveConflict(storeName: string, localData: any, cloudData: any): Promise<any>;
    /**
     * Merge local and cloud data
     */
    private mergeData;
    /**
     * Start automatic synchronization
     */
    private startAutoSync;
    /**
     * Stop automatic synchronization
     */
    stopAutoSync(): void;
}

/**
 * CloudBrolostack - Cloud Integration Extension
 * Extends EnhancedBrolostack with optional cloud service integrations
 *
 * This is an ADDITIVE feature that doesn't break existing functionality
 * Cloud features are completely optional and opt-in
 */

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
interface CloudBrolostackConfig extends EnhancedBrolostackConfig {
    cloud?: {
        enabled: boolean;
        adapters: CloudAdapterConfig[];
        syncStrategy: 'local-first' | 'cloud-first' | 'hybrid';
        conflictResolution: 'client-wins' | 'server-wins' | 'merge';
        autoSync?: boolean;
        syncInterval?: number;
    };
}
interface CloudAdapterConfig {
    name: string;
    provider: string;
    config: any;
    enabled: boolean;
    priority?: number;
}
declare class CloudBrolostack extends EnhancedBrolostack {
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

/**
 * Browser Compatibility Manager
 * Ensures Brolostack works across all modern browsers
 */
interface BrowserInfo {
    name: string;
    version: string;
    isSupported: boolean;
    features: {
        localStorage: boolean;
        indexedDB: boolean;
        webSQL: boolean;
        navigator: boolean;
        window: boolean;
        promises: boolean;
        asyncAwait: boolean;
        es6Modules: boolean;
        privateMode: boolean;
        braveShields: boolean;
        duckDuckGoPrivacy: boolean;
    };
}
interface CompatibilityReport {
    isCompatible: boolean;
    browser: BrowserInfo;
    missingFeatures: string[];
    fallbacks: string[];
    recommendations: string[];
}
declare class BrowserCompatibility {
    private static instance;
    private browserInfo;
    private constructor();
    static getInstance(): BrowserCompatibility;
    /**
     * Detect browser and check compatibility
     */
    detectBrowser(): BrowserInfo;
    /**
     * Check if browser is supported
     */
    isBrowserSupported(browserName: string, version: string): boolean;
    /**
     * Check browser features
     */
    private checkFeatures;
    private checkLocalStorage;
    private checkIndexedDB;
    private checkWebSQL;
    private checkNavigator;
    private checkWindow;
    private checkPromises;
    private checkAsyncAwait;
    private checkES6Modules;
    private checkPrivateMode;
    private checkBraveShields;
    private checkDuckDuckGoPrivacy;
    /**
     * Generate compatibility report
     */
    generateReport(): CompatibilityReport;
    /**
     * Get storage driver priority based on browser support
     */
    getStorageDriverPriority(): string[];
    /**
     * Check if enhanced features are supported
     */
    isEnhancedFeaturesSupported(): boolean;
    private extractVersion;
    /**
     * Get compatibility information for logging
     */
    getCompatibilityInfo(): {
        browser: string;
        version: string;
        isCompatible: boolean;
        missingFeatures: string[];
        fallbacks: string[];
        storageDrivers: string[];
    };
}
declare const browserCompatibility: BrowserCompatibility;

/**
 * Browser Compatible Sync Manager
 * Handles sync functionality across different browser versions
 */

interface SyncConfig {
    enabled: boolean;
    serverUrl?: string;
    apiKey?: string;
    syncInterval?: number;
    conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
}
declare class BrowserCompatibleSyncManager {
    private config;
    private eventEmitter;
    private logger;
    private syncInterval?;
    private isOnline;
    constructor(config: SyncConfig, eventEmitter: EventEmitter, logger: Logger);
    /**
     * Setup online/offline event listeners with fallbacks
     */
    private setupOnlineOfflineListeners;
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

interface BrowserCompatibleStorageConfig {
    name: string;
    version: number;
    size: number;
    storeName?: string;
    fallbackToMemory?: boolean;
}
declare class BrowserCompatibleStorageAdapter extends LocalStorageAdapter {
    private fallbackStorage;
    private useFallback;
    constructor(config: BrowserCompatibleStorageConfig);
    /**
     * Get item with fallback support
     */
    getItem(key: string): Promise<string | null>;
    /**
     * Set item with fallback support
     */
    setItem(key: string, value: string): Promise<void>;
    /**
     * Remove item with fallback support
     */
    removeItem(key: string): Promise<void>;
    /**
     * Clear all items with fallback support
     */
    clear(): Promise<void>;
    /**
     * Get all keys with fallback support
     */
    getKeys(): Promise<string[]>;
    /**
     * Get storage size with fallback support
     */
    getSize(): number;
    /**
     * Check if using fallback storage
     */
    isUsingFallback(): boolean;
    /**
     * Get browser compatibility info
     */
    getBrowserInfo(): CompatibilityReport;
}

/**
 * Private Mode Storage Adapter
 * Provides storage solutions that work in all browsers' private/incognito modes
 */

interface PrivateModeStorageConfig {
    name: string;
    version: number;
    size: number;
    storeName?: string;
    fallbackToMemory?: boolean;
}
declare class PrivateModeStorageAdapter implements StorageAdapter {
    private memoryStorage;
    private sessionStorage;
    private isPrivateMode;
    private browserInfo;
    constructor(_config: PrivateModeStorageConfig);
    /**
     * Get item with private mode support
     */
    getItem(key: string): Promise<string | null>;
    /**
     * Set item with private mode support
     */
    setItem(key: string, value: string): Promise<void>;
    /**
     * Remove item with private mode support
     */
    removeItem(key: string): Promise<void>;
    /**
     * Clear all items with private mode support
     */
    clear(): Promise<void>;
    /**
     * Get all keys with private mode support
     */
    keys(): Promise<string[]>;
    /**
     * Get storage length with private mode support
     */
    length(): Promise<number>;
    /**
     * Check if in private mode
     */
    isInPrivateMode(): boolean;
    /**
     * Get browser info
     */
    getBrowserInfo(): any;
    /**
     * Get storage method being used
     */
    getStorageMethod(): string;
    /**
     * Export data for backup (works in private mode)
     */
    exportData(): Promise<string>;
    /**
     * Import data from backup (works in private mode)
     */
    importData(dataString: string): Promise<boolean>;
}

/**
 * Private Mode Manager
 * Handles private/incognito mode detection and management across all browsers
 */
interface PrivateModeInfo {
    isPrivateMode: boolean;
    browser: string;
    storageMethod: 'localStorage' | 'sessionStorage' | 'memory' | 'indexedDB';
    limitations: string[];
    recommendations: string[];
}
declare class PrivateModeManager {
    private static instance;
    private privateModeInfo;
    private constructor();
    static getInstance(): PrivateModeManager;
    /**
     * Detect private mode across all browsers
     */
    detectPrivateMode(): PrivateModeInfo;
    /**
     * Test if sessionStorage works
     */
    private testSessionStorage;
    /**
     * Test if IndexedDB works
     */
    private testIndexedDB;
    /**
     * Get storage recommendations for private mode
     */
    getStorageRecommendations(): string[];
    /**
     * Get private mode limitations
     */
    getLimitations(): string[];
    /**
     * Check if private mode is active
     */
    isPrivateMode(): boolean;
    /**
     * Get recommended storage method
     */
    getRecommendedStorageMethod(): string;
    /**
     * Get private mode information for logging
     */
    getPrivateModeInfo(): {
        browser: string;
        isPrivateMode: boolean;
        storageMethod: string;
        limitations?: string[];
        recommendations?: string[];
    };
    /**
     * Get private mode status for UI
     */
    getPrivateModeStatus(): {
        isPrivate: boolean;
        message: string;
        icon: string;
        color: string;
    };
    /**
     * Create storage adapter for private mode
     */
    createPrivateModeStorageAdapter(config: any): Promise<PrivateModeStorageAdapter> | Promise<LocalStorageAdapter>;
}
declare const privateModeManager: PrivateModeManager;

/**
 * Brolostack - Local API Implementation
 * Provides a REST-like API interface for local storage operations
 */

declare class LocalAPI implements BrolostackAPI {
    private _storage;
    private router;
    private middleware;
    constructor(_storage: StorageAdapter);
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: any): Promise<T>;
    put<T>(endpoint: string, data: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
    patch<T>(endpoint: string, data: any): Promise<T>;
    private request;
    /**
     * Register a new endpoint
     */
    registerEndpoint(endpoint: LocalAPIEndpoint): void;
    /**
     * Add middleware
     */
    use(middleware: APIMiddleware): void;
    /**
     * Setup default endpoints
     */
    private setupDefaultEndpoints;
}

/**
 * Brolostack - AI Manager
 * Manages AI agents and provides AI capabilities for the framework
 */

declare class AIManager {
    private _storage;
    private eventEmitter;
    agents: Map<string, AIAgent>;
    multiAgentSystems: Map<string, AIMultiAgentSystem>;
    private memory;
    private isInitialized;
    constructor(_storage: StorageAdapter, eventEmitter: EventEmitter);
    initialize(): Promise<void>;
    createAgent(config: AIAgentConfig): AIAgent;
    getAgent(id: string): AIAgent | undefined;
    removeAgent(id: string): boolean;
    getAllAgents(): AIAgent[];
    exportMemory(): Promise<Record<string, any>>;
    importMemory(data: Record<string, any>): Promise<void>;
    storeMemory(key: string, value: any, type?: 'conversation' | 'context' | 'knowledge' | 'preference', importance?: number): Promise<void>;
    clearMemory(): Promise<void>;
    getMemoryStats(): AIMemoryStats;
    private loadAgents;
    private saveAgent;
}

interface BrolostackProviderProps {
    appName: string;
    config?: Partial<BrolostackConfig>;
    children: ReactNode;
}
declare function BrolostackProvider({ appName, config, children }: BrolostackProviderProps): react_jsx_runtime.JSX.Element;
declare function useBrolostack(): BrolostackContextValue;
declare function useBrolostackStore<T>(storeName: string): BrolostackStore<T>;

export { AIManager, Brolostack, BrolostackProvider, BrowserCompatibility, BrowserCompatibleStorageAdapter, BrowserCompatibleSyncManager, CloudBrolostack, CloudSyncManager, EnhancedBrolostack, EnhancedStorageAdapter, EventEmitter, LocalAPI, LocalStorageAdapter, LogLevel, Logger, PrivateModeManager, PrivateModeStorageAdapter, SyncManager, browserCompatibility, Brolostack as default, privateModeManager, useBrolostack, useBrolostackStore };
export type { AIAgent, AIAgentConfig, AIAgentState, AICapabilities, AIChoice, AIConfig, AICoordinationRule, AICoordinator, AIError, AIGuardrails, AIMemory, AIMemoryEntry, AIMemoryStats, AIMessage, AIMultiAgentState, AIMultiAgentStats, AIMultiAgentSystem, AIResponse, AIResult, AITask, AITaskRequirement, AITool, AIToolCall, AIUsage, AIWorkflow, AIWorkflowCondition, AIWorkflowStep, APIBatchRequest, APIBatchResponse, APICache, APIClient, APIConfig, APIError, APIGraphQLClient, APIGraphQLRequest, APIGraphQLResponse, APIMetric, APIMiddleware, APIMonitoring, APIMonitoringStats, APIRateLimit, APIRequest, APIResponse, APISocket, APISubscription, AWSConfig, AnalyticsEvent, BrolostackAPI, BrolostackApp, BrolostackConfig, BrolostackContextValue, BrolostackError, BrolostackHook, BrolostackMiddleware, BrolostackPlugin, BrolostackProviderProps$1 as BrolostackProviderProps, BrolostackStore, CloudAdapter$1 as CloudAdapter, CloudAdapterCapabilities, CloudAdapterStatus, CloudBackup, CloudSyncEvent, CloudflareConfig, DeepPartial, FileSystemNode, FirebaseConfig, GoogleCloudConfig, LocalAPIEndpoint, LocalAPIRequest, LocalAPIResponse, LocalAPIRouter, MongoDBConfig, PersistConfig, ProjectConfig, RedisConfig, StorageAdapter, StorageBackup, StorageCompression, StorageConfig, StorageDriver, StorageEncryption, StorageEvent, StorageEventType, StorageIndex, StorageItem, StorageMigration, StorageOperation, StorageOptions, StorageQuery, StorageSchema, StorageStats, StorageStoreSchema, StorageTransaction, StoreState, UserSession };
