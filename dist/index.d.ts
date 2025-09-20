import { ReactNode } from 'react';
import { Server } from 'http';
import { Server as Server$1 } from 'https';
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
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'aws' | 'huggingface' | 'cohere' | 'ai21' | 'deepseek' | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimapi' | 'mistral' | 'groq' | 'replicate' | 'custom';
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
 * Enterprise Authentication & Authorization Manager
 * Provides robust authentication, RBAC, and credential management
 */

interface CIAMProviderConfig {
    auth0?: {
        domain: string;
        clientId: string;
        clientSecret?: string;
        audience?: string;
        scope?: string;
        customDomain?: string;
    };
    entraId?: {
        tenantId: string;
        clientId: string;
        clientSecret?: string;
        redirectUri: string;
        scopes?: string[];
        authority?: string;
    };
    cognito?: {
        userPoolId: string;
        userPoolWebClientId: string;
        region: string;
        identityPoolId?: string;
        domain?: string;
        oauth?: {
            domain: string;
            scope: string[];
            redirectSignIn: string;
            redirectSignOut: string;
            responseType: string;
        };
    };
    keycloak?: {
        url: string;
        realm: string;
        clientId: string;
        clientSecret?: string;
        publicClient?: boolean;
    };
    okta?: {
        issuer: string;
        clientId: string;
        clientSecret?: string;
        redirectUri: string;
        scopes?: string[];
        pkce?: boolean;
    };
    stytch?: {
        projectId: string;
        secret: string;
        publicToken: string;
        environment: 'test' | 'live';
    };
    firebase?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        appId: string;
        measurementId?: string;
    };
    frontegg?: {
        baseUrl: string;
        clientId: string;
        appId: string;
    };
    workos?: {
        apiKey: string;
        clientId: string;
        redirectUri: string;
        environment?: 'development' | 'staging' | 'production';
    };
}
interface CloudAuthConfig {
    aws?: {
        region: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        sessionToken?: string;
        profile?: string;
    };
    azure?: {
        subscriptionId: string;
        tenantId: string;
        clientId?: string;
        clientSecret?: string;
    };
    gcp?: {
        projectId: string;
        keyFilename?: string;
        credentials?: any;
    };
}
interface HybridAuthConfig {
    mode: 'brolostack-only' | 'hybrid' | 'tribrid';
    primary: 'brolostack' | 'ciam' | 'cloud';
    fallbacks: ('brolostack' | 'ciam' | 'cloud')[];
    syncSessions: boolean;
    userMapping: {
        enabled: boolean;
        strategy: 'email' | 'username' | 'custom';
        customMappingFunction?: (user: any) => string;
    };
    tokenStrategy: 'primary-only' | 'all-providers' | 'best-available';
}
interface AuthConfig {
    provider: 'local' | 'oauth' | 'saml' | 'ldap' | 'custom' | 'ciam' | 'hybrid' | 'tribrid';
    endpoints?: {
        login: string;
        logout: string;
        refresh: string;
        profile: string;
    };
    oauth?: {
        clientId: string;
        clientSecret?: string;
        redirectUri: string;
        scopes: string[];
        provider: 'google' | 'microsoft' | 'github' | 'custom';
        customEndpoints?: {
            authorization: string;
            token: string;
            userInfo: string;
        };
    };
    ciam?: {
        provider: 'auth0' | 'entraId' | 'cognito' | 'keycloak' | 'okta' | 'stytch' | 'firebase' | 'frontegg' | 'workos';
        config: CIAMProviderConfig;
        integration: {
            syncWithBrolostack: boolean;
            useBrolostackStorage: boolean;
            enableOfflineMode: boolean;
            customUserMapping?: (ciamUser: any) => User;
        };
    };
    cloudAuth?: CloudAuthConfig;
    hybrid?: HybridAuthConfig;
    tokenStorage: 'localStorage' | 'sessionStorage' | 'memory' | 'secure' | 'brolostack-encrypted';
    autoRefresh: boolean;
    sessionTimeout?: number;
    multiFactorAuth?: {
        enabled: boolean;
        methods: ('sms' | 'email' | 'totp' | 'hardware')[];
        ciamMfaIntegration?: boolean;
    };
    advanced?: {
        singleSignOn: boolean;
        socialLogins: string[];
        passwordlessAuth: boolean;
        biometricAuth: boolean;
        riskBasedAuth: boolean;
        adaptiveAuth: boolean;
    };
}
interface User {
    id: string;
    username: string;
    email: string;
    displayName: string;
    roles: Role[];
    permissions: Permission[];
    metadata?: Record<string, any>;
    lastLogin?: Date;
    isActive: boolean;
    mfaEnabled?: boolean;
}
interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isSystemRole: boolean;
    hierarchy: number;
}
interface Permission {
    id: string;
    resource: string;
    action: string;
    conditions?: Record<string, any>;
    description: string;
}
interface AuthToken {
    accessToken: string;
    refreshToken?: string;
    tokenType: string;
    expiresIn: number;
    expiresAt: Date;
    scope?: string[];
}
interface LoginCredentials {
    username: string;
    password: string;
    mfaCode?: string;
    rememberMe?: boolean;
}
interface AuthSession {
    user: User;
    token: AuthToken;
    sessionId: string;
    createdAt: Date;
    lastActivity: Date;
    ipAddress?: string;
    userAgent?: string;
    ciamProvider?: string;
    ciamUserId?: string;
    ciamToken?: any;
    cloudProvider?: string;
    cloudCredentials?: any;
    providerSessions?: Map<string, any>;
    syncStatus?: 'synced' | 'pending' | 'failed';
    lastSync?: Date;
    hybridMode?: boolean;
    tribridMode?: boolean;
    primaryProvider?: string;
    activeProvider?: string;
    availableProviders?: string[];
}
interface CIAMProvider {
    name: string;
    initialize(config: any): Promise<void>;
    login(credentials?: any): Promise<any>;
    logout(): Promise<void>;
    getUser(): Promise<any>;
    refreshToken(): Promise<any>;
    isAuthenticated(): boolean;
    enableMFA?(): Promise<void>;
    socialLogin?(provider: string): Promise<any>;
    passwordlessLogin?(identifier: string): Promise<any>;
    biometricLogin?(): Promise<any>;
}
interface CloudAuthProvider {
    name: string;
    initialize(config: any): Promise<void>;
    authenticate(): Promise<any>;
    getCredentials(): Promise<any>;
    refreshCredentials(): Promise<any>;
    isAuthenticated(): boolean;
}
declare class AuthManager extends EventEmitter {
    private config;
    private currentSession;
    private logger;
    private refreshTimer;
    private sessionTimer;
    private ciamProviders;
    private activeCiamProvider;
    private cloudProviders;
    private providerSessions;
    private syncTimer;
    private readonly systemRoles;
    private readonly systemPermissions;
    constructor(config: AuthConfig);
    login(credentials: LoginCredentials): Promise<AuthSession>;
    logout(): Promise<void>;
    refreshToken(): Promise<AuthToken>;
    hasPermission(resource: string, action: string, context?: Record<string, any>): boolean;
    hasRole(roleName: string): boolean;
    hasAnyRole(roleNames: string[]): boolean;
    hasAllRoles(roleNames: string[]): boolean;
    getHighestRole(): Role | null;
    getCurrentUser(): User | null;
    getCurrentSession(): AuthSession | null;
    isAuthenticated(): boolean;
    isTokenValid(): boolean;
    storeSecureCredential(key: string, value: string): Promise<void>;
    getSecureCredential(key: string): Promise<string | null>;
    removeSecureCredential(key: string): Promise<void>;
    private localLogin;
    private oauthLogin;
    private customLogin;
    private createSession;
    private parseTokenResponse;
    private parseUserResponse;
    private parseRole;
    private parsePermission;
    private matchesPermission;
    private storeToken;
    private clearStoredToken;
    private scheduleTokenRefresh;
    private scheduleSessionTimeout;
    private generateSessionId;
    private getClientIP;
    private encryptValue;
    private decryptValue;
    private storeInSecureStorage;
    private getFromSecureStorage;
    private removeFromSecureStorage;
    private initializeSystemRoles;
    private initializeProviders;
    private initializeCiamProvider;
    private initializeCloudProviders;
    private ciamLogin;
    private hybridLogin;
    private tribridLogin;
    private cloudLogin;
    private mapCiamUserToBrolostack;
    private syncCiamUserWithBrolostack;
    private createCloudUser;
    private createTokenFromCloudAuth;
    private mapCiamRolesToBrolostack;
    private mapCiamPermissionsToBrolostack;
    private scheduleSessionSync;
    private syncProviderSessions;
    enableMFA(): Promise<void>;
    socialLogin(provider: string): Promise<AuthSession>;
    passwordlessLogin(identifier: string): Promise<AuthSession>;
    biometricLogin(): Promise<AuthSession>;
    getActiveProviders(): string[];
    getProviderSession(providerName: string): any;
    switchProvider(providerType: 'ciam' | 'cloud', providerName?: string): Promise<void>;
}

/**
 * Brolostack Environment Manager
 * Seamless Development, Testing, and Production Environment Management
 *
 * Features:
 * - Automatic environment detection
 * - Environment-specific optimizations
 * - Smooth environment switching
 * - Performance optimizations per environment
 * - Security configurations per environment
 */

type BrolostackEnvironment = 'development' | 'testing' | 'staging' | 'production';
interface EnvironmentConfig {
    environment: BrolostackEnvironment;
    debug: boolean;
    performance: {
        enableMinification: boolean;
        enableCompression: boolean;
        enableTreeShaking: boolean;
        enableCaching: boolean;
        cacheStrategy: 'aggressive' | 'moderate' | 'minimal' | 'none';
        bundleOptimization: boolean;
        lazyLoading: boolean;
    };
    security: {
        enableDetailedErrors: boolean;
        enableStackTraces: boolean;
        enableConsoleLogging: boolean;
        enableSourceMaps: boolean;
        enableCORS: boolean;
        corsOrigins: string[] | '*';
        enableCSP: boolean;
        cspPolicy: string;
    };
    storage: {
        engine: 'localStorage' | 'indexedDB' | 'memory';
        encryption: boolean;
        compression: boolean;
        maxSize: number;
        persistentCache: boolean;
    };
    api: {
        enableMocking: boolean;
        enableRateLimiting: boolean;
        requestTimeout: number;
        retryAttempts: number;
        enableRequestLogging: boolean;
    };
    cloud: {
        enableCloudSync: boolean;
        syncStrategy: 'real-time' | 'batch' | 'manual';
        enableBackup: boolean;
        backupFrequency: number;
        enableMultiCloud: boolean;
    };
    monitoring: {
        enableAnalytics: boolean;
        enableErrorTracking: boolean;
        enablePerformanceMonitoring: boolean;
        enableUserTracking: boolean;
        sampleRate: number;
    };
}
declare class EnvironmentManager {
    private logger;
    private currentEnvironment;
    private config;
    constructor();
    /**
     * Automatically detect the current environment
     */
    private detectEnvironment;
    /**
     * Create environment-specific configuration
     */
    private createEnvironmentConfig;
    /**
     * Get current environment
     */
    getEnvironment(): BrolostackEnvironment;
    /**
     * Get environment configuration
     */
    getConfig(): EnvironmentConfig;
    /**
     * Check if running in development
     */
    isDevelopment(): boolean;
    /**
     * Check if running in testing
     */
    isTesting(): boolean;
    /**
     * Check if running in staging
     */
    isStaging(): boolean;
    /**
     * Check if running in production
     */
    isProduction(): boolean;
    /**
     * Switch environment (for testing purposes)
     */
    switchEnvironment(env: BrolostackEnvironment): void;
    /**
     * Apply environment configuration to Brolostack config
     */
    applyToConfig(brolostackConfig: BrolostackConfig): BrolostackConfig;
    /**
     * Get performance optimizations for current environment
     */
    getPerformanceOptimizations(): {
        shouldMinify: boolean;
        shouldCompress: boolean;
        shouldTreeShake: boolean;
        shouldCache: boolean;
        cacheStrategy: string;
        shouldLazyLoad: boolean;
    };
    /**
     * Get security configurations for current environment
     */
    getSecurityConfig(): {
        showDetailedErrors: boolean;
        showStackTraces: boolean;
        enableConsoleLogging: boolean;
        enableSourceMaps: boolean;
        corsConfig: {
            enabled: boolean;
            origins: string[] | '*';
        };
        cspConfig: {
            enabled: boolean;
            policy: string;
        };
    };
    /**
     * Log environment-aware message
     */
    log(level: 'info' | 'warn' | 'error', message: string, data?: any): void;
    /**
     * Handle environment-specific error reporting
     */
    handleError(error: Error, context?: any): void;
    private generateErrorId;
    private sendToErrorTracking;
}
declare const environmentManager: EnvironmentManager;
declare const Environment: {
    current: () => BrolostackEnvironment;
    isDev: () => boolean;
    isTest: () => boolean;
    isStaging: () => boolean;
    isProd: () => boolean;
    config: () => EnvironmentConfig;
    log: (level: "info" | "warn" | "error", message: string, data?: any) => void;
    handleError: (error: Error, context?: any) => void;
};

/**
 * BrolostackWSClientside - Revolutionary Client-Side WebSocket Framework
 * Seamless real-time communication for modern web applications
 *
 * Features:
 * - Environment-aware WebSocket connections
 * - Automatic reconnection with exponential backoff
 * - Message queuing and offline support
 * - TypeScript-first API with full type safety
 * - React hooks integration
 * - Multi-room support
 * - Built-in performance monitoring
 */

interface BrolostackWSClientsideConfig {
    url?: string;
    path?: string;
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    timeout?: number;
    forceNew?: boolean;
    auth?: {
        apiKey?: string | undefined;
        token?: string | undefined;
        userId?: string | undefined;
    };
    compression?: boolean;
    enableHeartbeat?: boolean;
    heartbeatInterval?: number;
    messageQueue?: {
        enabled: boolean;
        maxSize: number;
        persistOffline: boolean;
    };
    performance?: {
        enableMetrics: boolean;
        sampleRate: number;
    };
}
interface WSConnectionStats {
    connected: boolean;
    environment: string;
    connectionTime?: number;
    reconnectCount: number;
    messagesSent: number;
    messagesReceived: number;
    averageLatency: number;
    lastActivity: number;
    rooms: string[];
}
interface WSRoom {
    id: string;
    name: string;
    memberCount: number;
    joinedAt: number;
    lastActivity: number;
    messageCount: number;
}
declare class BrolostackWSClientside extends EventEmitter {
    private socket;
    private logger;
    private config;
    private messageQueue;
    private rooms;
    private stats;
    private latencyMeasurements;
    private heartbeatTimer?;
    constructor(config?: Partial<BrolostackWSClientsideConfig>);
    /**
     * Create environment-specific configuration
     */
    private createEnvironmentConfig;
    /**
     * Get default WebSocket URL based on environment
     */
    private getDefaultURL;
    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Setup Socket.IO event handlers
     */
    private setupEventHandlers;
    /**
     * Connection event handlers
     */
    private handleConnect;
    private handleDisconnect;
    private handleReconnect;
    private handleReconnectError;
    /**
     * Message handling
     */
    private handleMessage;
    /**
     * Room management handlers
     */
    private handleRoomJoined;
    private handleRoomLeft;
    private handleUserJoined;
    private handleUserLeft;
    /**
     * Public API methods
     */
    /**
     * Send message to server
     */
    send(event: string, data: any, options?: {
        room?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        requiresAck?: boolean;
    }): void;
    /**
     * Join a room
     */
    joinRoom(roomId: string, roomName?: string, userInfo?: any): void;
    /**
     * Leave a room
     */
    leaveRoom(roomId: string): void;
    /**
     * Send message to specific room
     */
    sendToRoom(roomId: string, event: string, data: any): void;
    /**
     * Broadcast message to all rooms
     */
    broadcast(event: string, data: any): void;
    /**
     * Subscribe to specific event
     */
    on(event: string, handler: (data: any) => void): void;
    /**
     * Unsubscribe from event
     */
    off(event: string, handler?: (data: any) => void): void;
    /**
     * Message queuing for offline support
     */
    private queueMessage;
    /**
     * Process queued messages when connection is restored
     */
    private processMessageQueue;
    /**
     * Load persisted message queue
     */
    private loadPersistedQueue;
    /**
     * Heartbeat management
     */
    private startHeartbeat;
    private stopHeartbeat;
    /**
     * Performance monitoring
     */
    private updateLatencyMetrics;
    /**
     * Utility methods
     */
    private generateMessageId;
    /**
     * Get connection status
     */
    isConnected(): boolean;
    /**
     * Get current rooms
     */
    getRooms(): WSRoom[];
    /**
     * Get connection statistics
     */
    getStats(): WSConnectionStats;
    /**
     * Get socket ID
     */
    getSocketId(): string | undefined;
    /**
     * Disconnect from server
     */
    disconnect(): void;
    /**
     * Reconnect to server
     */
    reconnect(): void;
    /**
     * Environment-specific optimizations
     */
    /**
     * Enable development mode features
     */
    enableDevMode(): void;
    /**
     * Enable production mode optimizations
     */
    enableProdMode(): void;
    /**
     * Cleanup and destroy
     */
    destroy(): void;
}
declare function useBrolostackWebSocket(config?: Partial<BrolostackWSClientsideConfig>): {
    ws: BrolostackWSClientside | null;
    connected: boolean;
    stats: WSConnectionStats | null;
    joinRoom: (roomId: string, roomName?: string, userInfo?: any) => void | undefined;
    leaveRoom: (roomId: string) => void | undefined;
    send: (event: string, data: any, options?: any) => void | undefined;
    sendToRoom: (roomId: string, event: string, data: any) => void | undefined;
    broadcast: (event: string, data: any) => void | undefined;
    on: (event: string, handler: (data: any) => void) => void | undefined;
    off: (event: string, handler?: (data: any) => void) => void | undefined;
};
declare global {
    namespace React {
        function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
        function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    }
}

interface WebSocketConfig$1 {
    url: string;
    protocols?: string[];
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    authentication?: {
        type: 'bearer' | 'basic' | 'custom';
        token?: string;
        username?: string;
        password?: string;
        customHeaders?: Record<string, string>;
    };
    compression?: boolean;
    binaryType?: 'blob' | 'arraybuffer';
}
interface WebSocketMessage$1 {
    id: string;
    type: string;
    payload: any;
    timestamp: number;
    source?: string;
    target?: string;
}
interface WebSocketChannel {
    name: string;
    subscribers: Set<string>;
    messageHistory: WebSocketMessage$1[];
    maxHistory?: number;
}
declare class WebSocketManager extends EventEmitter {
    private config;
    private socket;
    private connected;
    private reconnectAttempts;
    private reconnectTimer;
    private heartbeatTimer;
    private channels;
    private messageQueue;
    private logger;
    private messageId;
    constructor(config: WebSocketConfig$1);
    connect(): Promise<void>;
    disconnect(): void;
    isConnected(): boolean;
    createChannel(name: string, maxHistory?: number): WebSocketChannel;
    joinChannel(channelName: string, subscriberId: string): boolean;
    leaveChannel(channelName: string, subscriberId: string): boolean;
    deleteChannel(channelName: string): boolean;
    getChannel(channelName: string): WebSocketChannel | undefined;
    getChannels(): string[];
    send(message: Partial<WebSocketMessage$1>): boolean;
    sendToChannel(channelName: string, message: Partial<WebSocketMessage$1>): boolean;
    broadcast(message: Partial<WebSocketMessage$1>): boolean;
    startDataStream(streamName: string, dataSource: () => Promise<any>, interval?: number): void;
    sendBinary(data: ArrayBuffer | Blob, metadata?: any): boolean;
    private handleMessage;
    private handleChannelMessage;
    private scheduleReconnect;
    private startHeartbeat;
    private stopHeartbeat;
    private processMessageQueue;
    private generateMessageId;
    getConnectionState(): string;
    getStats(): {
        connected: boolean;
        connectionState: string;
        reconnectAttempts: number;
        queuedMessages: number;
        channels: number;
        totalChannelSubscribers: number;
        environment: BrolostackEnvironment;
    };
    /**
     * Create enhanced WebSocket client for multi-agent communication
     */
    createMultiAgentClient(config?: Partial<BrolostackWSClientsideConfig>): BrolostackWSClientside;
    /**
     * Get environment-specific WebSocket configuration
     */
    getEnvironmentConfig(): {
        reconnectionAttempts: number;
        reconnectionDelay: number;
        timeout: number;
        compression: boolean;
        enableAuth: boolean;
    };
}

/**
 * Brolostack Multi-Rendering Mode (MRM) Manager
 * Provides enhanced performance through SSR, SSG, and hybrid pre-rendering capabilities
 */

interface MRMConfig {
    mode: 'ssr' | 'ssg' | 'hybrid';
    cacheStrategy: 'none' | 'memory' | 'disk' | 'redis';
    cacheMaxAge?: number;
    prerenderRoutes?: string[];
    staticGeneration?: {
        outputDir: string;
        buildTime: boolean;
        incremental: boolean;
    };
    hydration?: {
        strategy: 'immediate' | 'lazy' | 'on-demand';
        chunkSize?: number;
    };
}
interface RenderContext {
    url: string;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    userAgent: string;
    isBot: boolean;
    timestamp: Date;
}
interface RenderResult {
    html: string;
    metadata: {
        title?: string;
        description?: string;
        keywords?: string[];
        ogTags?: Record<string, string>;
        jsonLd?: Record<string, any>[];
    };
    performance: {
        renderTime: number;
        cacheHit: boolean;
        hydrationData?: any;
    };
    headers: Record<string, string>;
}
declare class BrolostackMRMManager {
    private config;
    private brolostack;
    private logger;
    private renderCache;
    private isServerEnvironment;
    constructor(brolostack: Brolostack, config: MRMConfig);
    /**
     * Render React components for SSR/SSG
     */
    renderReact(component: any, context: RenderContext, initialData?: any): Promise<RenderResult>;
    /**
     * Generate static pages for SSG
     */
    generateStaticPages(routes: string[], _outputDir: string): Promise<void>;
    /**
     * Extract initial data for hydration
     */
    extractInitialData(): Promise<any>;
    /**
     * Create hydration script for client-side
     */
    createHydrationScript(data: any): string;
    render(context: RenderContext): Promise<RenderResult>;
    generateStatic(routes?: string[]): Promise<Map<string, RenderResult>>;
    hydrate(element: HTMLElement, data: any): Promise<void>;
    generateMetadata(context: RenderContext, data: any): RenderResult['metadata'];
    preloadCriticalResources(context: RenderContext): Promise<string[]>;
    invalidateCache(pattern?: string): Promise<void>;
    private performRender;
    private loadInitialData;
    private renderToString;
    private getTemplate;
    private processTemplate;
    private wrapInDocument;
    private generateHeadContent;
    private generateHydrationScript;
    private generateCacheKey;
    private getCachedResult;
    private cacheResult;
    private writeStaticFile;
    private immediateHydration;
    private lazyHydration;
    /**
     * Render component to string (placeholder for React integration)
     */
    private renderComponentToString;
    private onDemandHydration;
    private extractTitle;
    private extractDescription;
    private extractKeywords;
    private generateJsonLd;
    private extractCriticalCSS;
    private extractCriticalJS;
    private extractCriticalFonts;
    private prepareHydrationData;
    private generateHeaders;
}

/**
 * Brolostack Worker - Enterprise-Grade Background Processing
 * Handles all cloud database operations, real-time sync, and security protocols
 * Ensures main UI thread remains responsive and jank-free
 */

interface BrolostackWorkerConfig {
    security: {
        encryption: {
            enabled: boolean;
            algorithm: 'AES-GCM' | 'ChaCha20-Poly1305' | 'AES-CBC';
            keySize: 128 | 192 | 256;
            keyDerivation: 'PBKDF2' | 'scrypt' | 'Argon2';
        };
        blockchain: {
            enabled: boolean;
            networkType: 'private' | 'consortium' | 'public';
            consensusAlgorithm: 'PoW' | 'PoS' | 'PBFT' | 'Raft';
            blockSize: number;
            difficulty: number;
        };
        authentication: {
            multiFactorRequired: boolean;
            biometricEnabled: boolean;
            sessionTimeout: number;
            tokenRotationInterval: number;
        };
    };
    performance: {
        batchSize: number;
        maxConcurrentOperations: number;
        retryAttempts: number;
        retryBackoff: 'linear' | 'exponential' | 'fixed';
        cacheSize: number;
        compressionEnabled: boolean;
    };
    database: {
        providers: Array<{
            name: string;
            type: 'sql' | 'nosql' | 'graph' | 'cache';
            config: any;
            priority: number;
            enabled: boolean;
        }>;
        defaultProvider: string;
        sharding: {
            enabled: boolean;
            strategy: 'range' | 'hash' | 'directory';
            shardKey: string;
        };
        replication: {
            enabled: boolean;
            factor: number;
            consistency: 'eventual' | 'strong' | 'bounded';
        };
    };
    realtime: {
        enabled: boolean;
        protocol: 'websocket' | 'sse' | 'polling';
        heartbeatInterval: number;
        reconnectAttempts: number;
        bufferSize: number;
    };
}
interface WorkerMessage {
    id: string;
    type: 'crud' | 'sync' | 'realtime' | 'security' | 'analytics' | 'config';
    operation: string;
    payload: any;
    timestamp: number;
    priority: 'low' | 'normal' | 'high' | 'critical';
    retryCount?: number;
    metadata?: {
        userId?: string;
        sessionId?: string;
        requestId?: string;
        source?: string;
    };
}
interface WorkerResponse {
    id: string;
    success: boolean;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
        recoverable: boolean;
    };
    metadata: {
        executionTime: number;
        provider?: string;
        cacheHit?: boolean;
        securityLevel?: string;
        timestamp: number;
    };
}
declare class BrolostackWorker extends EventEmitter {
    private config;
    private logger;
    private securityManager;
    private crudManager;
    private syncManager;
    private networkManager;
    private operationQueue;
    private isRunning;
    private workerInstance;
    private messageHandlers;
    private performanceMetrics;
    constructor(config: BrolostackWorkerConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    executeOperation(message: Omit<WorkerMessage, 'id' | 'timestamp'>): Promise<WorkerResponse>;
    create(provider: string, collection: string, data: any, options?: any): Promise<any>;
    read(provider: string, collection: string, filter?: any, options?: any): Promise<any>;
    update(provider: string, collection: string, filter: any, data: any, options?: any): Promise<any>;
    delete(provider: string, collection: string, filter: any, options?: any): Promise<any>;
    startSync(storeName: string, options?: {
        interval?: number;
        providers?: string[];
        conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'manual';
    }): Promise<string>;
    stopSync(syncId: string): Promise<void>;
    forcSync(storeName: string, providers?: string[]): Promise<void>;
    encryptData(data: any, keyId?: string): Promise<{
        encryptedData: string;
        keyId: string;
        algorithm: string;
        iv: string;
    }>;
    decryptData(encryptedData: string, keyId: string, iv: string): Promise<any>;
    createSecureTransaction(operations: Array<{
        type: 'create' | 'update' | 'delete';
        provider: string;
        collection: string;
        data?: any;
        filter?: any;
    }>): Promise<string>;
    getOperationMetrics(): Promise<{
        totalOperations: number;
        successRate: number;
        averageLatency: number;
        providerStats: Record<string, any>;
        securityEvents: number;
        cachePerformance: any;
    }>;
    initializeApplicationTemplate(applicationType: 'ecommerce' | 'social-media' | 'delivery-service' | 'collaboration-messaging' | 'enterprise-management' | 'file-storage' | 'learning-portal' | 'ai-coding-assistant' | 'ai-writing-tool' | 'ai-chat-platform' | 'multi-agent-system' | 'ai-search', config: any): Promise<{
        templateId: string;
        stores: string[];
        syncConfigs: any[];
        securityPolicies: any[];
        realTimeChannels: string[];
    }>;
    private createWorkerInstance;
    private generateWorkerScript;
    private setupMessageHandlers;
    private addToQueue;
    private startOperationProcessor;
    private processOperationInWorker;
    private handleWorkerMessage;
    private handleOperationCompleted;
    private handleOperationFailed;
    private handleWorkerError;
    private calculateRetryDelay;
    private drainOperationQueue;
    private startPerformanceMonitoring;
    private updatePerformanceMetrics;
    private getAnalyticsData;
    private handleConfigOperation;
    private generateOperationId;
    getQueueStats(): {
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    };
    getPerformanceMetrics(): {
        operationsPerSecond: number;
        averageLatency: number;
        errorRate: number;
        cacheHitRate: number;
        lastUpdated: Date;
    };
    isWorkerRunning(): boolean;
    getConfig(): BrolostackWorkerConfig;
    updateConfig(updates: Partial<BrolostackWorkerConfig>): void;
}

/**
 * Brolostack Security Module
 * Core security utilities and types for client-side and AI application security
 * Provides enterprise-grade security for regular Brolostack framework users
 */
interface BrolostackSecurityConfig {
    clientSide: {
        dataEncryption: {
            enabled: boolean;
            algorithm: 'AES-GCM' | 'ChaCha20-Poly1305';
            keySize: 128 | 192 | 256;
            autoEncryptSensitiveData: boolean;
            sensitiveDataPatterns: string[];
        };
        storageProtection: {
            encryptLocalStorage: boolean;
            encryptSessionStorage: boolean;
            encryptIndexedDB: boolean;
            storageQuota: number;
            dataRetention: number;
        };
        inputValidation: {
            enabled: boolean;
            sanitizeHTML: boolean;
            validateEmails: boolean;
            validatePhoneNumbers: boolean;
            customValidators: Record<string, (value: any) => boolean>;
        };
        csrfProtection: {
            enabled: boolean;
            tokenName: string;
            headerName: string;
            cookieName: string;
        };
    };
    aiSecurity: {
        promptSanitization: {
            enabled: boolean;
            blockMaliciousPrompts: boolean;
            maxPromptLength: number;
            bannedKeywords: string[];
            allowedDomains: string[];
        };
        responseFiltering: {
            enabled: boolean;
            blockSensitiveInfo: boolean;
            contentModerationLevel: 'low' | 'medium' | 'high' | 'strict';
            customFilters: Array<{
                name: string;
                pattern: string;
                action: 'block' | 'warn' | 'sanitize';
            }>;
        };
        rateLimiting: {
            enabled: boolean;
            maxRequestsPerMinute: number;
            maxRequestsPerHour: number;
            maxRequestsPerDay: number;
            blockOnExceed: boolean;
        };
        auditLogging: {
            enabled: boolean;
            logPrompts: boolean;
            logResponses: boolean;
            logUserActions: boolean;
            retentionPeriod: number;
        };
    };
    authentication: {
        required: boolean;
        methods: Array<'password' | 'biometric' | 'oauth' | 'sso' | 'magic-link'>;
        sessionManagement: {
            timeout: number;
            maxConcurrentSessions: number;
            renewOnActivity: boolean;
        };
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSymbols: boolean;
            preventCommonPasswords: boolean;
            preventReuse: number;
        };
    };
    privacy: {
        dataMinimization: boolean;
        consentManagement: {
            enabled: boolean;
            requiredConsents: string[];
            consentExpiry: number;
        };
        dataSubjectRights: {
            enableDataExport: boolean;
            enableDataDeletion: boolean;
            enableDataPortability: boolean;
        };
        complianceFrameworks: Array<'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD'>;
    };
    monitoring: {
        threatDetection: {
            enabled: boolean;
            detectBruteForce: boolean;
            detectAnomalousActivity: boolean;
            detectDataExfiltration: boolean;
        };
        alerting: {
            enabled: boolean;
            alertThreshold: 'low' | 'medium' | 'high' | 'critical';
            notificationChannels: string[];
        };
        reporting: {
            enabled: boolean;
            generateDailyReports: boolean;
            generateWeeklyReports: boolean;
            generateMonthlyReports: boolean;
        };
    };
}
interface SecurityEvent {
    id: string;
    timestamp: Date;
    type: SecurityEventType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: 'client' | 'ai' | 'auth' | 'storage' | 'network';
    userId?: string;
    sessionId?: string;
    details: {
        description: string;
        metadata: Record<string, any>;
        stackTrace?: string;
        userAgent?: string;
        ipAddress?: string;
        geolocation?: {
            country: string;
            region: string;
            city: string;
        };
    };
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
type SecurityEventType = 'unauthorized_access' | 'brute_force_attempt' | 'malicious_prompt' | 'data_exfiltration' | 'injection_attempt' | 'anomalous_activity' | 'privacy_violation' | 'compliance_breach' | 'encryption_failure' | 'authentication_failure' | 'authentication_success' | 'session_hijack' | 'csrf_attack' | 'xss_attempt' | 'rate_limit_exceeded' | 'suspicious_ai_usage' | 'data_access' | 'data_subject_request' | 'session_revoked' | 'encryption_success' | 'validation_failed' | 'validation_passed' | 'prompt_analyzed' | 'malicious_prompt';
interface EncryptionResult {
    encryptedData: string;
    iv: string;
    authTag?: string;
    keyId: string;
    algorithm: string;
    timestamp: Date;
}
interface DecryptionRequest {
    encryptedData: string;
    iv: string;
    authTag?: string;
    keyId: string;
    algorithm: string;
}
interface CryptoKey$1 {
    id: string;
    algorithm: string;
    keySize: number;
    purpose: 'encryption' | 'signing' | 'key-derivation';
    createdAt: Date;
    expiresAt?: Date;
    rotationCount: number;
    metadata: {
        userId?: string;
        applicationId?: string;
        dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
    };
}
interface ValidationRule {
    name: string;
    pattern?: string | RegExp;
    validator?: (value: any) => boolean;
    message: string;
    required?: boolean;
}
interface ValidationResult {
    valid: boolean;
    errors: Array<{
        field: string;
        message: string;
        value: any;
    }>;
    warnings: Array<{
        field: string;
        message: string;
        value: any;
    }>;
}
interface SanitizationOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    removeScripts: boolean;
    removeStyles: boolean;
    removeComments: boolean;
    encodeEntities: boolean;
}
interface AIPromptAnalysis {
    safe: boolean;
    riskScore: number;
    detectedThreats: Array<{
        type: 'injection' | 'malicious_code' | 'data_extraction' | 'social_engineering' | 'inappropriate_content';
        confidence: number;
        description: string;
        recommendation: string;
    }>;
    sanitizedPrompt?: string;
    metadata: {
        originalLength: number;
        sanitizedLength?: number;
        processingTime: number;
        modelUsed: string;
    };
}
interface AIResponseAnalysis {
    safe: boolean;
    riskScore: number;
    detectedIssues: Array<{
        type: 'sensitive_info' | 'harmful_content' | 'misinformation' | 'privacy_violation' | 'bias';
        confidence: number;
        description: string;
        recommendation: string;
    }>;
    filteredResponse?: string;
    metadata: {
        originalLength: number;
        filteredLength?: number;
        processingTime: number;
        contentModerationLevel: string;
    };
}
interface AIUsageMetrics {
    userId: string;
    sessionId: string;
    totalRequests: number;
    requestsInLastMinute: number;
    requestsInLastHour: number;
    requestsInLastDay: number;
    averageResponseTime: number;
    totalTokensUsed: number;
    riskScore: number;
    flaggedRequests: number;
    lastActivity: Date;
}
interface AuthenticationResult {
    success: boolean;
    userId?: string;
    sessionId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    permissions?: string[];
    roles?: string[];
    metadata?: {
        loginMethod: string;
        deviceId: string;
        ipAddress: string;
        userAgent: string;
        geolocation?: {
            country: string;
            region: string;
            city: string;
        };
    };
    securityFlags?: {
        requirePasswordChange: boolean;
        requireMFA: boolean;
        suspiciousActivity: boolean;
        newDevice: boolean;
    };
}
interface SessionInfo {
    id: string;
    userId: string;
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    deviceId: string;
    active: boolean;
    permissions: string[];
    roles: string[];
    securityLevel: 'low' | 'medium' | 'high';
    metadata: Record<string, any>;
}
interface ConsentRecord {
    userId: string;
    consentType: string;
    granted: boolean;
    grantedAt: Date;
    expiresAt?: Date;
    withdrawnAt?: Date;
    version: string;
    metadata: {
        ipAddress: string;
        userAgent: string;
        method: 'explicit' | 'implicit' | 'pre_checked';
    };
}
interface DataSubjectRequest {
    id: string;
    userId: string;
    type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    requestedAt: Date;
    completedAt?: Date;
    description: string;
    legalBasis?: string;
    processingDetails?: string;
    responseData?: any;
}
interface ComplianceReport {
    id: string;
    framework: 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD';
    generatedAt: Date;
    period: {
        start: Date;
        end: Date;
    };
    summary: {
        totalUsers: number;
        totalDataProcessed: number;
        consentRate: number;
        dataSubjectRequests: number;
        securityIncidents: number;
        complianceScore: number;
    };
    violations: Array<{
        type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        affectedUsers: number;
        remediation: string;
        status: 'open' | 'resolved';
    }>;
    recommendations: string[];
}
interface SecurityUtils {
    encrypt(data: any, options?: Partial<EncryptionOptions>): Promise<EncryptionResult>;
    decrypt(request: DecryptionRequest): Promise<any>;
    generateKey(purpose: 'encryption' | 'signing', options?: Partial<KeyGenerationOptions>): Promise<CryptoKey$1>;
    rotateKey(keyId: string): Promise<CryptoKey$1>;
    validateInput(data: any, rules: ValidationRule[]): ValidationResult;
    sanitizeHTML(html: string, options?: SanitizationOptions): string;
    sanitizeSQL(query: string): string;
    detectXSS(input: string): boolean;
    detectSQLInjection(input: string): boolean;
    analyzePrompt(prompt: string): Promise<AIPromptAnalysis>;
    analyzeResponse(response: string): Promise<AIResponseAnalysis>;
    checkAIUsageLimits(userId: string): Promise<AIUsageMetrics>;
    sanitizePrompt(prompt: string): string;
    filterResponse(response: string): string;
    authenticate(credentials: any, method: string): Promise<AuthenticationResult>;
    createSession(userId: string, metadata?: any): Promise<SessionInfo>;
    validateSession(sessionId: string): Promise<SessionInfo | null>;
    revokeSession(sessionId: string): Promise<boolean>;
    renewSession(sessionId: string): Promise<SessionInfo>;
    recordConsent(userId: string, consentType: string, granted: boolean): Promise<ConsentRecord>;
    checkConsent(userId: string, consentType: string): Promise<ConsentRecord | null>;
    processDataSubjectRequest(request: Omit<DataSubjectRequest, 'id' | 'requestedAt'>): Promise<DataSubjectRequest>;
    generateComplianceReport(framework: string, startDate: Date, endDate: Date): Promise<ComplianceReport>;
    logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<SecurityEvent>;
    getSecurityEvents(filters?: any): Promise<SecurityEvent[]>;
    analyzeSecurityTrends(): Promise<any>;
    generateSecurityReport(period: {
        start: Date;
        end: Date;
    }): Promise<any>;
    detectBruteForce(userId: string, ipAddress: string): Promise<boolean>;
    detectAnomalousActivity(userId: string, activity: any): Promise<boolean>;
    detectDataExfiltration(userId: string, dataAccess: any): Promise<boolean>;
    calculateRiskScore(userId: string, context: any): Promise<number>;
    secureStore(key: string, value: any, options?: SecureStorageOptions): Promise<boolean>;
    secureRetrieve(key: string, options?: SecureStorageOptions): Promise<any>;
    secureDelete(key: string, options?: SecureStorageOptions): Promise<boolean>;
    clearSecureStorage(): Promise<boolean>;
}
interface EncryptionOptions {
    algorithm: 'AES-GCM' | 'ChaCha20-Poly1305';
    keySize: 128 | 192 | 256;
    keyId?: string;
    associatedData?: string;
}
interface KeyGenerationOptions {
    algorithm: string;
    keySize: number;
    extractable: boolean;
    keyUsages: string[];
    expiresIn?: number;
}
interface SecureStorageOptions {
    encrypt: boolean;
    compress: boolean;
    ttl?: number;
    namespace?: string;
    backup?: boolean;
}
declare const SENSITIVE_DATA_PATTERNS: {
    EMAIL: RegExp;
    PHONE: RegExp;
    SSN: RegExp;
    CREDIT_CARD: RegExp;
    API_KEY: RegExp;
    PASSWORD: RegExp;
    JWT_TOKEN: RegExp;
    IP_ADDRESS: RegExp;
    URL: RegExp;
};
declare const MALICIOUS_PATTERNS: {
    SQL_INJECTION: RegExp[];
    XSS: RegExp[];
    COMMAND_INJECTION: RegExp[];
    AI_PROMPT_INJECTION: RegExp[];
};
declare const SECURITY_HEADERS: {
    CSP: string;
    HSTS: string;
    X_FRAME_OPTIONS: string;
    X_CONTENT_TYPE_OPTIONS: string;
    X_XSS_PROTECTION: string;
    REFERRER_POLICY: string;
    PERMISSIONS_POLICY: string;
};
declare const COMPLIANCE_REQUIREMENTS: {
    GDPR: {
        dataRetentionMaxDays: number;
        consentExpiryDays: number;
        dataSubjectRequestResponseDays: number;
        breachNotificationHours: number;
        requiredConsents: string[];
        dataProcessingLegalBases: string[];
    };
    CCPA: {
        dataRetentionMaxDays: number;
        consentExpiryDays: number;
        dataSubjectRequestResponseDays: number;
        requiredDisclosures: string[];
        consumerRights: string[];
    };
    HIPAA: {
        dataRetentionMinYears: number;
        auditLogRetentionYears: number;
        encryptionRequired: boolean;
        accessLogRequired: boolean;
        breachNotificationDays: number;
        businessAssociateAgreementRequired: boolean;
    };
    PCI_DSS: {
        encryptionRequired: boolean;
        keyRotationDays: number;
        accessLogRetentionMonths: number;
        vulnerabilityTestingRequired: boolean;
        networkSegmentationRequired: boolean;
        strongCryptographyRequired: boolean;
    };
};
declare class SecurityError extends Error {
    code: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any> | undefined;
    constructor(message: string, code: string, severity?: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any> | undefined);
}
declare class ValidationError extends SecurityError {
    field: string;
    value: any;
    constructor(message: string, field: string, value: any);
}
declare class AuthenticationError extends SecurityError {
    reason: string;
    constructor(message: string, reason: string);
}
declare class EncryptionError extends SecurityError {
    operation: string;
    constructor(message: string, operation: string);
}
declare class ComplianceError extends SecurityError {
    framework: string;
    violation: string;
    constructor(message: string, framework: string, violation: string);
}
type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';
type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
type ComplianceFramework = 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD' | 'HIPAA' | 'PCI_DSS' | 'SOC2' | 'ISO27001';
type AuthenticationMethod = 'password' | 'biometric' | 'oauth' | 'sso' | 'magic-link' | 'mfa';
type EncryptionAlgorithm = 'AES-GCM' | 'ChaCha20-Poly1305' | 'AES-CBC' | 'RSA-OAEP';
type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'bcrypt' | 'scrypt' | 'argon2';

/**
 * Brolostack Security Implementation
 * Core security utilities for client-side and AI application security
 * Easy-to-use security layer for regular Brolostack framework
 */

declare class BrolostackSecurity extends EventEmitter implements SecurityUtils {
    private config;
    private logger;
    private encryptionKeys;
    private sessions;
    private securityEvents;
    private rateLimiters;
    private consentRecords;
    constructor(config?: Partial<BrolostackSecurityConfig>);
    private mergeWithDefaults;
    private initialize;
    encrypt(data: any, options?: any): Promise<EncryptionResult>;
    decrypt(request: DecryptionRequest): Promise<any>;
    generateKey(purpose: 'encryption' | 'signing', options?: any): Promise<any>;
    rotateKey(keyId: string): Promise<any>;
    validateInput(data: any, rules: ValidationRule[]): ValidationResult;
    sanitizeHTML(html: string, options?: any): string;
    sanitizeSQL(query: string): string;
    detectXSS(input: string): boolean;
    detectSQLInjection(input: string): boolean;
    analyzePrompt(prompt: string): Promise<AIPromptAnalysis>;
    analyzeResponse(response: string): Promise<AIResponseAnalysis>;
    checkAIUsageLimits(userId: string): Promise<any>;
    sanitizePrompt(prompt: string): string;
    filterResponse(response: string): string;
    authenticate(credentials: any, method: string): Promise<AuthenticationResult>;
    createSession(userId: string, metadata?: any): Promise<SessionInfo>;
    validateSession(sessionId: string): Promise<SessionInfo | null>;
    revokeSession(sessionId: string): Promise<boolean>;
    renewSession(sessionId: string): Promise<SessionInfo>;
    recordConsent(userId: string, consentType: string, granted: boolean): Promise<ConsentRecord>;
    checkConsent(userId: string, consentType: string): Promise<ConsentRecord | null>;
    processDataSubjectRequest(request: any): Promise<any>;
    generateComplianceReport(framework: string, startDate: Date, endDate: Date): Promise<any>;
    logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<SecurityEvent>;
    getSecurityEvents(filters?: any): Promise<SecurityEvent[]>;
    analyzeSecurityTrends(): Promise<any>;
    generateSecurityReport(period: {
        start: Date;
        end: Date;
    }): Promise<any>;
    detectBruteForce(userId: string, ipAddress: string): Promise<boolean>;
    detectAnomalousActivity(userId: string, activity: any): Promise<boolean>;
    detectDataExfiltration(userId: string, dataAccess: any): Promise<boolean>;
    calculateRiskScore(userId: string, context: any): Promise<number>;
    secureStore(key: string, value: any, options?: any): Promise<boolean>;
    secureRetrieve(key: string, _options?: any): Promise<any>;
    secureDelete(key: string, _options?: any): Promise<boolean>;
    clearSecureStorage(): Promise<boolean>;
    private detectSensitiveData;
    private validatePassword;
    private setupSecureStorage;
    private startThreatDetection;
    private generateSessionId;
    private generateDeviceId;
    private generateAccessToken;
    private arrayBufferToHex;
    private hexToArrayBuffer;
    private getTopEventTypes;
    private calculateRiskLevel;
    private calculateAverageResolutionTime;
    private getEventBreakdown;
    private generateSecurityRecommendations;
    getConfig(): BrolostackSecurityConfig;
    updateConfig(updates: Partial<BrolostackSecurityConfig>): void;
    getSecurityStatus(): {
        encryptionEnabled: boolean;
        activeSessions: number;
        recentEvents: number;
        riskLevel: string;
        complianceStatus: string;
    };
}

/**
 * Shared AI Provider Types and Interfaces
 * Extracted to break circular dependency between AIProviderFactory and AllAIProviders
 */

type AIProvider = 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' | 'huggingface' | 'stability-ai' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi';
interface AIProviderConfig {
    provider: AIProvider;
    apiKey?: string;
    endpoint?: string;
    region?: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
    timeout?: number;
    retryAttempts?: number;
    customHeaders?: Record<string, string>;
    rateLimiting?: {
        requestsPerMinute: number;
        tokensPerMinute: number;
    };
}
interface AIProviderResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
    provider: AIProvider;
    timestamp: Date;
    metadata?: Record<string, any>;
}
interface AIProviderCapabilities {
    textGeneration: boolean;
    chatCompletion: boolean;
    imageGeneration: boolean;
    imageAnalysis: boolean;
    audioGeneration: boolean;
    audioTranscription: boolean;
    embedding: boolean;
    fineTuning: boolean;
    streaming: boolean;
    functionCalling: boolean;
    multimodal: boolean;
    maxContextLength: number;
    supportedLanguages: string[];
}
declare abstract class BaseAIAdapter extends EventEmitter {
    protected config: AIProviderConfig;
    protected logger: Logger;
    constructor(config: AIProviderConfig);
    abstract generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    abstract streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void>;
    abstract generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
    abstract chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    abstract getCapabilities(): AIProviderCapabilities;
    abstract healthCheck(): Promise<void>;
    analyzeImage?(image: string | Blob, prompt?: string): Promise<any>;
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
    lastError?: string | undefined;
}
interface CloudAdapterCapabilities {
    supportsSync: boolean;
    supportsBackup: boolean;
    supportsRestore: boolean;
    supportsRealTime: boolean;
    maxDataSize?: number;
    supportedFormats: string[];
}
interface CloudProviderCapabilities {
    storage: {
        objectStorage: boolean;
        blockStorage: boolean;
        fileStorage: boolean;
        cdn: boolean;
        backup: boolean;
    };
    database: {
        relational: boolean;
        nosql: boolean;
        cache: boolean;
        search: boolean;
        analytics: boolean;
    };
    compute: {
        serverless: boolean;
        containers: boolean;
        virtualMachines: boolean;
        kubernetes: boolean;
        gpu: boolean;
        edge: boolean;
    };
    ai: {
        machineLearning: boolean;
        naturalLanguage: boolean;
        computerVision: boolean;
        speechRecognition: boolean;
        recommendation: boolean;
    };
    networking: {
        loadBalancer: boolean;
        cdn: boolean;
        dns: boolean;
        vpn: boolean;
        firewall: boolean;
    };
    security: {
        encryption: boolean;
        iam: boolean;
        compliance: string[];
        audit: boolean;
        backup: boolean;
    };
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
interface DigitalOceanConfig {
    token: string;
    region: string;
    spacesAccessKey?: string;
    spacesSecretKey?: string;
    spacesEndpoint?: string;
}
interface CloudflareConfig {
    accountId: string;
    apiToken: string;
    databaseId?: string;
    bucketName?: string;
}
interface CloudflareConfig {
    accountId: string;
    apiToken: string;
    zoneId?: string;
    workersKV?: {
        namespaceId: string;
    };
    r2?: {
        bucketName: string;
    };
    d1?: {
        databaseId: string;
    };
}
interface AlibabaCloudConfig {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    endpoint?: string;
    securityToken?: string;
}
interface IBMCloudConfig {
    apiKey: string;
    region: string;
    serviceInstanceId?: string;
    iamUrl?: string;
    endpoint?: string;
}
interface OracleCloudConfig {
    tenancy: string;
    user: string;
    fingerprint: string;
    privateKey: string;
    region: string;
    compartmentId?: string;
}
interface SalesforceCloudConfig {
    instanceUrl: string;
    accessToken: string;
    clientId?: string;
    clientSecret?: string;
    username?: string;
    password?: string;
    securityToken?: string;
}
interface TencentCloudConfig {
    secretId: string;
    secretKey: string;
    region: string;
    token?: string;
    endpoint?: string;
}
interface HuaweiCloudConfig {
    accessKey: string;
    secretKey: string;
    region: string;
    projectId?: string;
    securityToken?: string;
}
interface VMwareCloudConfig {
    refreshToken: string;
    orgId: string;
    sddcId?: string;
    apiUrl?: string;
}
interface RackspaceConfig {
    username: string;
    apiKey: string;
    region: string;
    authUrl?: string;
    tenantId?: string;
}
interface NetAppConfig {
    endpoint: string;
    username: string;
    password: string;
    svm?: string;
    certificate?: string;
}
interface CohesityConfig {
    cluster: string;
    username: string;
    password: string;
    domain?: string;
    port?: number;
    apiVersion?: string;
}
interface OpenAIConfig {
    apiKey: string;
    organization?: string;
    baseURL?: string;
    defaultModel?: string;
    maxRetries?: number;
    timeout?: number;
}
interface AnthropicConfig {
    apiKey: string;
    baseURL?: string;
    defaultModel?: string;
    maxRetries?: number;
    timeout?: number;
}
interface HuggingFaceConfig {
    apiKey: string;
    model: string;
    endpoint?: string;
    task?: 'text-generation' | 'text-classification' | 'question-answering' | 'summarization';
    options?: Record<string, any>;
}
interface CohereConfig {
    apiKey: string;
    model?: string;
    version?: string;
    endpoint?: string;
}
interface MistralConfig {
    apiKey: string;
    model: string;
    endpoint?: string;
    safeMode?: boolean;
}
interface ReplicateConfig {
    apiToken: string;
    model: string;
    version?: string;
    webhook?: string;
}
interface StabilityAIConfig {
    apiKey: string;
    engine?: string;
    host?: string;
}
interface PerplexityConfig {
    apiKey: string;
    model: string;
    endpoint?: string;
}
interface IBMWatsonConfig {
    apiKey: string;
    serviceUrl: string;
    version: string;
    authenticator?: 'iam' | 'basic' | 'bearer';
}
interface DatabricksConfig {
    host: string;
    token: string;
    clusterId?: string;
    workspaceUrl?: string;
}
interface TogetherAIConfig {
    apiKey: string;
    model: string;
    endpoint?: string;
}
interface NLPCloudConfig {
    apiKey: string;
    model: string;
    gpu?: boolean;
    lang?: string;
}
interface MultiProviderConfig {
    primary: {
        provider: string;
        config: any;
    };
    fallback?: Array<{
        provider: string;
        config: any;
        priority: number;
    }>;
    loadBalancing?: {
        strategy: 'round-robin' | 'weighted' | 'least-connections' | 'random';
        healthCheck: boolean;
        healthCheckInterval: number;
    };
    failover?: {
        enabled: boolean;
        maxRetries: number;
        retryDelay: number;
        circuitBreaker: boolean;
    };
}
interface EnhancedCloudAdapter extends CloudAdapter$1 {
    setRegion(region: string): Promise<void>;
    getAvailableRegions(): Promise<string[]>;
    getCostEstimate(operation: string, data: any): Promise<number>;
    optimizeForCost(data: any): Promise<any>;
    getPerformanceMetrics(): Promise<{
        latency: number;
        throughput: number;
        errorRate: number;
        availability: number;
    }>;
    enableEncryption(keyId?: string): Promise<void>;
    disableEncryption(): Promise<void>;
    rotateKeys(): Promise<void>;
    getComplianceStatus(): Promise<{
        certifications: string[];
        auditLogs: boolean;
        dataResidency: string;
        privacyControls: string[];
    }>;
}
interface ProviderSelectionStrategy {
    selectProvider(availableProviders: string[], operation: string, data: any, context?: Record<string, any>): Promise<string>;
}
declare class CostOptimizedStrategy implements ProviderSelectionStrategy {
    selectProvider(availableProviders: string[], _operation: string, _data: any): Promise<string>;
}
declare class PerformanceOptimizedStrategy implements ProviderSelectionStrategy {
    selectProvider(availableProviders: string[], _operation: string, _data: any): Promise<string>;
}
declare class ComplianceOptimizedStrategy implements ProviderSelectionStrategy {
    constructor(_requiredCompliance: string[]);
    selectProvider(availableProviders: string[], _operation: string, _data: any): Promise<string>;
}

/**
 * Enterprise Cloud Adapters for Brolostack
 * Additional cloud service provider implementations
 */

declare class IBMCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private analyzeWithWatson;
}
declare class OracleCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private getOracleAuthHeader;
}
declare class SalesforceCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class SAPCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class DigitalOceanAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private getDigitalOceanAuthHeader;
}

/**
 * Modern Cloud Adapters for Brolostack
 * Next-generation cloud service provider implementations
 */

declare class TencentCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private getTencentAuthHeader;
}
declare class VMwareCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class CloudflareAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class CoreWeaveAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private getCoreWeaveAuthHeader;
}
declare class HuaweiCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private getHuaweiAuthHeader;
}

/**
 * Specialized Cloud Adapters for Brolostack
 * Niche and specialized cloud service provider implementations
 */

declare class RackspaceAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class CiscoCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class NetAppCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class DellCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class CohesityAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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
declare class BroadcomAdapter extends EventEmitter implements CloudAdapter$1 {
    name: string;
    provider: string;
    private config;
    private connected;
    private lastSync?;
    private lastBackup?;
    private _errorCount;
    private lastError?;
    constructor(config: CloudProviderConfig);
    connect(): Promise<void>;
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

/**
 * Cloud Provider Factory for Brolostack
 * Unified interface for all cloud service providers
 */

type CloudProvider = 'aws' | 'azure' | 'gcp' | 'alibaba-cloud' | 'ibm-cloud' | 'oracle-cloud' | 'salesforce-cloud' | 'sap-cloud' | 'digitalocean' | 'tencent-cloud' | 'vmware-cloud' | 'rackspace' | 'huawei-cloud' | 'cisco-cloud' | 'dell-cloud' | 'cloudflare' | 'netapp' | 'broadcom' | 'coreweave' | 'cohesity' | 'redis-cloud' | 'mongodb-atlas';
interface CloudProviderConfig {
    provider: CloudProvider;
    region?: string;
    credentials: {
        accessKeyId?: string;
        secretAccessKey?: string;
        sessionToken?: string;
        apiKey?: string;
        serviceAccountKey?: string;
        tenantId?: string;
        subscriptionId?: string;
        clientId?: string;
        clientSecret?: string;
        connectionString?: string;
    };
    services?: {
        storage?: boolean;
        database?: boolean;
        compute?: boolean;
        ai?: boolean;
        analytics?: boolean;
        security?: boolean;
        networking?: boolean;
    };
    endpoints?: {
        storage?: string;
        database?: string;
        ai?: string;
        analytics?: string;
    };
    timeout?: number;
    retryAttempts?: number;
    encryption?: {
        enabled: boolean;
        algorithm?: string;
        keyId?: string;
    };
}
declare class CloudProviderFactory extends EventEmitter {
    private logger;
    private providers;
    private configs;
    constructor();
    registerProvider(config: CloudProviderConfig): CloudAdapter$1;
    unregisterProvider(provider: CloudProvider): void;
    getProvider(provider: CloudProvider): CloudAdapter$1;
    syncAcrossProviders(sourceProvider: CloudProvider, targetProviders: CloudProvider[], data: any): Promise<Record<CloudProvider, any>>;
    backupAcrossProviders(primaryProvider: CloudProvider, backupProviders: CloudProvider[], data: any): Promise<Record<CloudProvider, any>>;
    private createProviderAdapter;
    getRegisteredProviders(): CloudProvider[];
    getProviderCapabilities(_provider: CloudProvider): CloudAdapterCapabilities;
    testProvider(provider: CloudProvider): Promise<boolean>;
    getStats(): {
        registeredProviders: number;
        providers: CloudProvider[];
    };
}

/**
 * Enterprise Provider Manager for Brolostack
 * Unified management for all AI and Cloud providers with enterprise features
 */

interface EnterpriseProviderConfig {
    ai: {
        providers: Array<{
            name: AIProvider;
            config: any;
            priority: number;
            enabled: boolean;
        }>;
        defaultProvider: AIProvider;
        loadBalancing: {
            enabled: boolean;
            strategy: 'round-robin' | 'weighted' | 'cost-optimized' | 'performance-optimized';
        };
        fallback: {
            enabled: boolean;
            maxRetries: number;
            retryDelay: number;
        };
        rateLimiting: {
            enabled: boolean;
            requestsPerMinute: number;
            tokensPerMinute: number;
        };
    };
    cloud: {
        providers: Array<{
            name: CloudProvider;
            config: any;
            priority: number;
            enabled: boolean;
            regions: string[];
        }>;
        defaultProvider: CloudProvider;
        multiRegion: {
            enabled: boolean;
            primaryRegion: string;
            backupRegions: string[];
        };
        backup: {
            enabled: boolean;
            frequency: number;
            retention: number;
            crossProvider: boolean;
        };
        compliance: {
            required: string[];
            dataResidency: string[];
            encryption: boolean;
        };
    };
    monitoring: {
        enabled: boolean;
        metrics: string[];
        alerting: {
            enabled: boolean;
            thresholds: Record<string, number>;
            webhooks: string[];
        };
    };
    security: {
        encryption: {
            enabled: boolean;
            algorithm: string;
            keyRotation: boolean;
            keyRotationInterval: number;
        };
        audit: {
            enabled: boolean;
            logLevel: 'basic' | 'detailed' | 'verbose';
            retention: number;
        };
    };
}
interface ProviderHealth {
    provider: string;
    type: 'ai' | 'cloud';
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    uptime: number;
    errorRate: number;
    lastCheck: Date;
    capabilities: any;
}
interface ProviderMetrics {
    provider: string;
    type: 'ai' | 'cloud';
    requests: {
        total: number;
        successful: number;
        failed: number;
        averageLatency: number;
    };
    usage: {
        dataTransferred: number;
        tokensUsed?: number;
        computeTime: number;
        cost: number;
    };
    timeRange: {
        start: Date;
        end: Date;
    };
}
declare class EnterpriseProviderManager extends EventEmitter {
    private config;
    private logger;
    private aiFactory;
    private cloudFactory;
    private healthChecks;
    private metrics;
    private healthCheckInterval?;
    private metricsCollectionInterval?;
    constructor(config: EnterpriseProviderConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    generateText(prompt: string, options?: {
        provider?: AIProvider;
        model?: string;
        temperature?: number;
        maxTokens?: number;
        streaming?: boolean;
    }): Promise<any>;
    chatCompletion(messages: any[], options?: {
        provider?: AIProvider;
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<any>;
    syncData(data: any, options?: {
        provider?: CloudProvider;
        crossProvider?: boolean;
        encryption?: boolean;
    }): Promise<any>;
    backupData(data: any, options?: {
        provider?: CloudProvider;
        crossProvider?: boolean;
        retention?: number;
    }): Promise<any>;
    selectOptimalAIProvider(operation: 'text-generation' | 'chat-completion' | 'embedding' | 'image-generation', context?: Record<string, any>): Promise<AIProvider>;
    selectOptimalCloudProvider(_operation: 'sync' | 'backup' | 'restore', _context?: Record<string, any>): Promise<CloudProvider>;
    private startHealthMonitoring;
    private checkProviderHealth;
    private startMetricsCollection;
    private collectMetrics;
    private roundRobinSelection;
    private weightedSelection;
    private costOptimizedSelection;
    private performanceOptimizedSelection;
    private tryAIFallback;
    private tryAIChatFallback;
    private syncAcrossProviders;
    private estimateProviderCost;
    private filterCompliantProviders;
    private updateMetrics;
    getProviderHealth(provider?: string): ProviderHealth[];
    getProviderMetrics(provider?: string): ProviderMetrics[];
    getRegisteredProviders(): {
        ai: AIProvider[];
        cloud: CloudProvider[];
    };
    getConfig(): EnterpriseProviderConfig;
    updateConfig(updates: Partial<EnterpriseProviderConfig>): void;
    getStats(): {
        aiProviders: {
            registeredProviders: number;
            providers: AIProvider[];
        };
        cloudProviders: {
            registeredProviders: number;
            providers: CloudProvider[];
        };
        healthChecks: number;
        metricsCollected: number;
        monitoringEnabled: boolean;
    };
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
    readonly auth?: AuthManager;
    readonly realtime?: WebSocketManager;
    readonly ssr?: BrolostackMRMManager;
    readonly worker?: BrolostackWorker;
    readonly security?: BrolostackSecurity;
    readonly providers?: EnterpriseProviderManager;
    readonly cloud?: any;
    private readonly eventEmitter;
    private readonly logger;
    private readonly aiManager;
    private isInitialized;
    private startTime;
    constructor(config: BrolostackConfig);
    /**
     * Initialize cloud integration using dynamic import
     */
    private initializeCloudIntegration;
    /**
     * Initialize enterprise features based on configuration
     */
    private initializeEnterpriseFeatures;
    /**
     * Initialize the Brolostack framework
     */
    initialize(): Promise<void>;
    /**
     * Initialize enterprise components
     */
    private initializeEnterpriseComponents;
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
        environment?: {
            current: string;
            debug: boolean;
            performance: any;
            security: any;
        };
        enterprise?: {
            auth?: boolean;
            realtime?: boolean;
            mrm?: boolean;
            worker?: boolean;
            security?: boolean;
            providers?: boolean;
            cloud?: boolean;
        };
    };
    /**
     * Check if any enterprise features are enabled
     */
    hasEnterpriseFeatures(): boolean;
    /**
     * Get enterprise feature status
     */
    getEnterpriseStatus(): {
        enabled: boolean;
        features: string[];
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
     * Destroy enterprise components
     */
    private destroyEnterpriseComponents;
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
 * Create environment-optimized Brolostack configuration
 */
declare function createEnvironmentConfig(baseConfig: Partial<BrolostackConfig>): BrolostackConfig;
/**
 * Get environment-specific API configuration
 */
declare function getApiConfig(): {
    timeout: number;
    retryAttempts: number;
    enableMocking: boolean;
    enableRateLimiting: boolean;
    enableRequestLogging: boolean;
};
/**
 * Get environment-specific storage configuration
 */
declare function getStorageConfig(): {
    engine: "indexedDB" | "localStorage" | "memory";
    encryption: boolean;
    compression: boolean;
    maxSize: number;
    persistentCache: boolean;
};
/**
 * Get environment-specific security headers
 */
declare function getSecurityHeaders(): Record<string, string>;
/**
 * Get CORS configuration for current environment
 */
declare function getCorsConfig(): {
    enabled: boolean;
    origins: string[] | "*";
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
};
/**
 * Performance timing utilities
 */
declare class PerformanceTimer {
    private startTime;
    private operation;
    constructor(operation: string);
    end(data?: any): void;
}
/**
 * Environment information for debugging
 */
declare function getEnvironmentInfo(): {
    current: BrolostackEnvironment;
    nodeEnv: string | undefined;
    brolostackEnv: string | undefined;
    isDevelopment: boolean;
    isTesting: boolean;
    isStaging: boolean;
    isProduction: boolean;
    config: EnvironmentConfig;
    timestamp: string;
};
/**
 * Validate environment setup
 */
declare function validateEnvironment(): {
    valid: boolean;
    warnings: string[];
    errors: string[];
};
declare const _default: {
    createEnvironmentConfig: typeof createEnvironmentConfig;
    log: {
        info: (message: string, data?: any) => void;
        warn: (message: string, data?: any) => void;
        error: (message: string, data?: any) => void;
        debug: (message: string, data?: any) => void;
        performance: (operation: string, startTime: number, data?: any) => void;
    };
    handleError: (error: Error, context?: any) => void;
    shouldEnable: {
        detailedErrors: () => boolean;
        consoleLogging: () => boolean;
        sourceMapping: () => boolean;
        analytics: () => boolean;
        errorTracking: () => boolean;
        performanceMonitoring: () => boolean;
        caching: () => boolean;
        compression: () => boolean;
        encryption: () => boolean;
    };
    getApiConfig: typeof getApiConfig;
    getStorageConfig: typeof getStorageConfig;
    getSecurityHeaders: typeof getSecurityHeaders;
    getCorsConfig: typeof getCorsConfig;
    PerformanceTimer: typeof PerformanceTimer;
    cache: {
        shouldCache: () => boolean;
        getStrategy: () => "aggressive" | "moderate" | "minimal" | "none";
        getTTL: (defaultTTL?: number) => number;
    };
    buildOptimizations: {
        shouldMinify: () => boolean;
        shouldCompress: () => boolean;
        shouldTreeShake: () => boolean;
        shouldLazyLoad: () => boolean;
        getCompressionLevel: () => 1 | 9 | 6;
    };
    getEnvironmentInfo: typeof getEnvironmentInfo;
    validateEnvironment: typeof validateEnvironment;
};

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
 * PostgreSQL Cloud Adapter for Brolostack
 * Provides secure, enterprise-grade PostgreSQL integration
 */

interface PostgreSQLConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    schema?: string;
    poolSize?: number;
    connectionTimeout?: number;
}
interface PostgreSQLQueryOptions {
    table: string;
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
    offset?: number;
}
declare class PostgreSQLAdapter extends EventEmitter implements CloudAdapter$1 {
    readonly name = "postgresql";
    readonly provider = "PostgreSQL";
    private config;
    private connected;
    private errorCount;
    private lastError?;
    private lastSync?;
    private lastBackup?;
    constructor(config: PostgreSQLConfig);
    connect(config?: PostgreSQLConfig): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    query(sql: string, params?: any[]): Promise<any>;
    findAll(options: PostgreSQLQueryOptions): Promise<any[]>;
    create(table: string, data: Record<string, any>): Promise<any>;
    update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<any>;
    delete(table: string, where: Record<string, any>): Promise<boolean>;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private sanitizeConfig;
}

/**
 * Supabase Cloud Adapter for Brolostack
 * Provides integration with Supabase for real-time database operations
 */

interface SupabaseConfig {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
    schema?: string;
    realtime?: boolean;
    auth?: {
        autoRefreshToken?: boolean;
        persistSession?: boolean;
        detectSessionInUrl?: boolean;
    };
}
interface SupabaseQueryOptions {
    table: string;
    select?: string;
    where?: Record<string, any>;
    orderBy?: {
        column: string;
        ascending?: boolean;
    };
    limit?: number;
    offset?: number;
    range?: {
        from: number;
        to: number;
    };
}
declare class SupabaseAdapter extends EventEmitter implements CloudAdapter$1 {
    readonly name = "supabase";
    readonly provider = "Supabase";
    private config;
    private connected;
    private errorCount;
    private lastError?;
    private lastSync?;
    private lastBackup?;
    private realtimeSubscriptions;
    constructor(config: SupabaseConfig);
    connect(config?: SupabaseConfig): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    query(options: SupabaseQueryOptions): Promise<any>;
    insert(table: string, data: Record<string, any> | Record<string, any>[]): Promise<any>;
    update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<any>;
    delete(table: string, where: Record<string, any>): Promise<boolean>;
    subscribeToTable(table: string, callback: (payload: any) => void): Promise<string>;
    unsubscribeFromTable(subscriptionId: string): Promise<void>;
    private initializeRealtime;
    private generateChecksum;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
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

/**
 * ARGS Protocol (Agent Real-time Governance & Streaming)
 * Invented by Olu Akinnawo within the Neo Cloud R&D project
 *
 * A revolutionary protocol for multi-agent collaboration and streaming
 * Provides standardized communication patterns for AI agents
 */
interface ARGSMessage {
    id: string;
    type: ARGSMessageType;
    timestamp: number;
    sessionId: string;
    agentId?: string | undefined;
    payload: any;
    metadata?: ARGSMetadata;
}
type ARGSMessageType = 'AGENT_REGISTER' | 'AGENT_UNREGISTER' | 'TASK_START' | 'TASK_PROGRESS' | 'TASK_COMPLETE' | 'TASK_ERROR' | 'COLLABORATION_REQUEST' | 'COLLABORATION_RESPONSE' | 'STREAM_START' | 'STREAM_DATA' | 'STREAM_END' | 'HEARTBEAT' | 'SYNC_REQUEST' | 'SYNC_RESPONSE';
interface ARGSMetadata {
    priority: 'low' | 'medium' | 'high' | 'critical';
    retryCount?: number;
    maxRetries?: number;
    ttl?: number;
    requiresAck?: boolean;
    correlationId?: string;
    sourceAgent?: string;
    targetAgent?: string | undefined;
    environment?: string;
}
interface ARGSAgentInfo {
    id: string;
    type: string;
    capabilities: string[];
    status: 'idle' | 'busy' | 'offline' | 'error';
    metadata: {
        name: string;
        version: string;
        description?: string;
        maxConcurrentTasks: number;
        currentTasks: number;
    };
}
interface ARGSTaskDefinition {
    id: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    requirements: {
        agentTypes: string[];
        capabilities: string[];
        maxExecutionTime?: number;
        resourceRequirements?: {
            memory?: number;
            cpu?: number;
            gpu?: boolean;
        };
    };
    payload: any;
    collaborationMode: 'sequential' | 'parallel' | 'hybrid';
    dependencies?: string[];
}
interface ARGSTaskProgress {
    taskId: string;
    agentId: string;
    step: string;
    status: 'started' | 'processing' | 'completed' | 'error' | 'paused';
    progress: number;
    message?: string;
    estimatedTimeRemaining?: number;
    subTasks?: ARGSTaskProgress[];
    metrics?: {
        executionTime: number;
        memoryUsage?: number;
        cpuUsage?: number;
        errorCount: number;
    };
}
interface ARGSCollaborationRequest {
    requestId: string;
    requestingAgent: string;
    targetAgent?: string;
    taskId: string;
    collaborationType: 'assistance' | 'delegation' | 'review' | 'merge';
    requiredCapabilities: string[];
    urgency: 'low' | 'medium' | 'high' | 'immediate';
    context: any;
    deadline?: number;
}
interface ARGSStreamConfig {
    streamId: string;
    type: 'text' | 'binary' | 'json' | 'media';
    compression?: boolean;
    encryption?: boolean;
    chunkSize?: number;
    bufferSize?: number;
    qualityOfService: 'best-effort' | 'guaranteed' | 'real-time';
}
declare class ARGSProtocolHandler {
    private messageHandlers;
    private agents;
    private collaborationRequests;
    constructor();
    private initializeHandlers;
    /**
     * Register a message handler for a specific message type
     */
    onMessage(type: ARGSMessageType, handler: (message: ARGSMessage) => void | Promise<void>): void;
    /**
     * Process an incoming ARGS message
     */
    processMessage(message: ARGSMessage): Promise<void>;
    /**
     * Create a standardized ARGS message
     */
    createMessage(type: ARGSMessageType, sessionId: string, payload: any, options?: {
        agentId?: string;
        metadata?: Partial<ARGSMetadata>;
    }): ARGSMessage;
    /**
     * Register an agent in the ARGS system
     */
    registerAgent(agentInfo: ARGSAgentInfo): ARGSMessage;
    /**
     * Create a collaboration request between agents
     */
    createCollaborationRequest(request: ARGSCollaborationRequest): ARGSMessage;
    /**
     * Create a task progress update
     */
    createProgressUpdate(progress: ARGSTaskProgress, sessionId: string): ARGSMessage;
    /**
     * Validate ARGS message structure
     */
    private validateMessage;
    /**
     * Generate unique message ID
     */
    private generateMessageId;
    /**
     * Get registered agents
     */
    getAgents(): Map<string, ARGSAgentInfo>;
    /**
     * Find agents by capability
     */
    findAgentsByCapability(capability: string): ARGSAgentInfo[];
    /**
     * Get collaboration requests
     */
    getCollaborationRequests(): Map<string, ARGSCollaborationRequest>;
}
declare const ARGS_VERSION = "1.0.0";
declare const ARGS_PROTOCOL_NAME = "ARGS";
declare const DEFAULT_ARGS_CONFIG: {
    heartbeatInterval: number;
    messageTimeout: number;
    maxRetries: number;
    compressionThreshold: number;
    maxMessageSize: number;
    queueSize: number;
};

/**
 * BrolostackWSMultiagent - Revolutionary Multi-Agent WebSocket Framework
 * Powered by ARGS Protocol for seamless agent collaboration and streaming
 *
 * Features:
 * - Multi-agent task coordination
 * - Real-time progress streaming
 * - Environment-aware configurations
 * - Node.js and Python backend compatibility
 * - Enterprise-grade security and performance
 */

interface BrolostackWSMultiagentConfig {
    port?: number;
    path?: string;
    cors?: {
        origin: string | string[] | boolean;
        methods?: string[];
        credentials?: boolean;
    };
    compression?: boolean;
    heartbeatInterval?: number;
    maxConnections?: number;
    rateLimiting?: {
        enabled: boolean;
        maxRequestsPerMinute: number;
        maxConcurrentTasks: number;
    };
    security?: {
        enableAuth: boolean;
        apiKeyRequired: boolean;
        allowedOrigins: string[];
        enableEncryption: boolean;
    };
    agents?: {
        maxAgentsPerSession: number;
        taskTimeout: number;
        collaborationTimeout: number;
        autoCleanupInterval: number;
    };
}
interface MultiAgentSession {
    sessionId: string;
    createdAt: number;
    lastActivity: number;
    status: 'active' | 'paused' | 'completed' | 'error';
    agents: Map<string, ARGSAgentInfo>;
    tasks: Map<string, ARGSTaskDefinition>;
    activeStreams: Map<string, ARGSStreamConfig>;
    collaborationRequests: Map<string, ARGSCollaborationRequest>;
    metrics: {
        totalTasks: number;
        completedTasks: number;
        errorCount: number;
        avgExecutionTime: number;
    };
}
declare class BrolostackWSMultiagent extends EventEmitter {
    private io;
    private logger;
    private argsHandler;
    private config;
    private sessions;
    private connectedClients;
    constructor(server: Server, config?: Partial<BrolostackWSMultiagentConfig>);
    /**
     * Initialize Socket.IO with dynamic import
     */
    private initializeSocketIO;
    /**
     * Create environment-specific configuration
     */
    private createEnvironmentConfig;
    /**
     * Setup Socket.IO event handlers
     */
    private setupEventHandlers;
    /**
     * Handle individual client connections
     */
    private handleClientConnection;
    /**
     * Setup ARGS protocol handlers
     */
    private setupARGSProtocol;
    /**
     * Setup client-specific event handlers
     */
    private setupClientHandlers;
    /**
     * Handle agent registration
     */
    private handleAgentRegistration;
    /**
     * Handle task start
     */
    private handleTaskStart;
    /**
     * Handle task progress updates
     */
    private handleTaskProgress;
    /**
     * Handle collaboration requests between agents
     */
    private handleCollaborationRequest;
    /**
     * Handle stream start
     */
    private handleStreamStart;
    /**
     * Handle stream data
     */
    private handleStreamData;
    /**
     * Client event handlers
     */
    private handleJoinSession;
    private handleLeaveSession;
    private handleRegisterAgent;
    private handleStartTask;
    private handleAgentProgress;
    private handleCollaborationRequestFromSocket;
    private handleStartStream;
    private handleStreamChunk;
    private handleARGSMessage;
    /**
     * Authentication for production environments
     */
    private authenticateClient;
    private validateApiKey;
    /**
     * Handle client disconnection
     */
    private handleClientDisconnection;
    /**
     * Utility methods
     */
    private getOrCreateSession;
    private findSuitableAgents;
    private findAgentsByCapabilities;
    private assignTaskToAgents;
    private assignSequentialTask;
    private assignParallelTask;
    private assignHybridTask;
    private updateSessionMetrics;
    private getServerCapabilities;
    /**
     * Cleanup inactive sessions
     */
    private startCleanupTimer;
    private cleanupSession;
    /**
     * Public API methods
     */
    /**
     * Get all active sessions
     */
    getActiveSessions(): Map<string, MultiAgentSession>;
    /**
     * Get session by ID
     */
    getSession(sessionId: string): MultiAgentSession | undefined;
    /**
     * Broadcast message to all clients in a session
     */
    broadcastToSession(sessionId: string, event: string, data: any): void;
    /**
     * Send message to specific agent
     */
    sendToAgent(sessionId: string, agentId: string, event: string, data: any): void;
    /**
     * Get comprehensive statistics
     */
    getStats(): {
        environment: string;
        activeSessions: number;
        connectedClients: number;
        totalAgents: number;
        activeStreams: number;
        totalTasks: number;
        completedTasks: number;
        errorRate: number;
        avgExecutionTime: number;
        uptime: number;
    };
    private startTime;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}

/**
 * Brolostack WebSocket Node.js Integration
 * Seamless integration with Express, NestJS, Fastify, and Koa
 */

interface NodeJSIntegrationConfig {
    framework: 'express' | 'nestjs' | 'fastify' | 'koa';
    server?: Server | Server$1;
    port?: number;
    host?: string;
    middleware?: {
        enableCors: boolean;
        enableRateLimit: boolean;
        enableAuth: boolean;
        enableLogging: boolean;
    };
    websocket?: Partial<BrolostackWSMultiagentConfig>;
}
declare class BrolostackNodeJSIntegration {
    private logger;
    private config;
    private wsMultiagent?;
    private server?;
    constructor(config: NodeJSIntegrationConfig);
    /**
     * Initialize with Express
     */
    static withExpress(app: any, config: Omit<NodeJSIntegrationConfig, 'framework'>): Promise<BrolostackNodeJSIntegration>;
    /**
     * Initialize with NestJS
     */
    static withNestJS(app: any, config: Omit<NodeJSIntegrationConfig, 'framework'>): Promise<BrolostackNodeJSIntegration>;
    /**
     * Initialize with Fastify
     */
    static withFastify(app: any, config: Omit<NodeJSIntegrationConfig, 'framework'>): Promise<BrolostackNodeJSIntegration>;
    /**
     * Setup Express integration
     */
    private setupExpress;
    /**
     * Setup NestJS integration
     */
    private setupNestJS;
    /**
     * Setup Fastify integration
     */
    private setupFastify;
    /**
     * Start the server
     */
    listen(port?: number, host?: string): Promise<void>;
    /**
     * Get WebSocket multi-agent instance
     */
    getMultiAgent(): BrolostackWSMultiagent | undefined;
    /**
     * Get HTTP server instance
     */
    getServer(): Server | Server$1 | undefined;
    /**
     * Get integration stats
     */
    getStats(): {
        framework: string;
        environment: string;
        server: {
            listening: boolean;
            address?: any;
        };
        websocket?: any;
    };
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}
declare class ExpressWebSocketSetup {
    static create(app: any, config?: Partial<BrolostackWSMultiagentConfig>): Promise<BrolostackWSMultiagent>;
}
declare class NestJSWebSocketSetup {
    static create(app: any, config?: Partial<BrolostackWSMultiagentConfig>): Promise<BrolostackWSMultiagent>;
}
declare class FastifyWebSocketSetup {
    static create(app: any, config?: Partial<BrolostackWSMultiagentConfig>): Promise<BrolostackWSMultiagent>;
}

/**
 * Brolostack WebSocket Python Integration
 * Seamless integration with FastAPI, Django, Flask, and Tornado
 */
interface PythonIntegrationConfig {
    framework: 'fastapi' | 'django' | 'flask' | 'tornado';
    host: string;
    port: number;
    path?: string;
    auth?: {
        apiKey?: string;
        token?: string;
    };
    cors?: {
        origins: string[];
        allow_credentials: boolean;
    };
    middleware?: string[];
}
declare class BrolostackPythonIntegration {
    private config;
    constructor(config: PythonIntegrationConfig);
    /**
     * Generate FastAPI integration code
     */
    generateFastAPIIntegration(): string;
    /**
     * Generate Django integration code
     */
    generateDjangoIntegration(): string;
    /**
     * Generate Flask integration code
     */
    generateFlaskIntegration(): string;
    /**
     * Generate Tornado integration code
     */
    generateTornadoIntegration(): string;
    /**
     * Generate integration code based on framework
     */
    generateIntegrationCode(): string;
    /**
     * Generate requirements.txt for Python dependencies
     */
    generateRequirements(): string;
    /**
     * Generate Docker configuration
     */
    generateDockerfile(): string;
    private getDockerStartCommand;
    /**
     * Generate complete project structure
     */
    generateProjectFiles(): {
        'main.py': string;
        'requirements.txt': string;
        'Dockerfile': string;
        'docker-compose.yml': string;
    };
    private generateDockerCompose;
}
declare class PythonClientIntegration {
    static generateClientCode(config: PythonIntegrationConfig): string;
}

/**
 * Real-time Communication Types for Brolostack
 * Enhanced with ARGS Protocol and Multi-Agent Support
 */
interface WebSocketConfig {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    compression?: boolean;
    enableMetrics?: boolean;
}
interface WebSocketMessage {
    id: string;
    type: string;
    payload: any;
    timestamp: number;
    sender?: string;
}
interface WebSocketRoom {
    id: string;
    name: string;
    members: string[];
    createdAt: number;
    lastActivity: number;
}
interface EnhancedWebSocketConfig {
    url?: string;
    path?: string;
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    timeout?: number;
    auth?: {
        apiKey?: string;
        token?: string;
        userId?: string;
        sessionToken?: string;
    };
    compression?: boolean;
    enableHeartbeat?: boolean;
    heartbeatInterval?: number;
    messageQueue?: {
        enabled: boolean;
        maxSize: number;
        persistOffline: boolean;
    };
    performance?: {
        enableMetrics: boolean;
        sampleRate: number;
        enableLatencyTracking: boolean;
    };
    environment?: {
        enableDevTools: boolean;
        enableDebugLogging: boolean;
        enableErrorReporting: boolean;
    };
}
interface AgentProgressUpdate {
    agentId: string;
    agentType: string;
    step: string;
    status: 'started' | 'processing' | 'completed' | 'error' | 'paused';
    progress: number;
    message?: string;
    timestamp: number;
    estimatedTimeRemaining?: number;
    metadata?: {
        executionTime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        errorCount?: number;
    };
}
interface RealtimeExecutionStep {
    id: string;
    name: string;
    description?: string;
    status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
    startTime?: number;
    endTime?: number;
    message?: string;
    progress: number;
    dependencies?: string[];
    assignedAgent?: string;
    subSteps?: RealtimeExecutionStep[];
}
interface RealtimeExecutionProcess {
    sessionId: string;
    processId: string;
    name: string;
    description?: string;
    agentType: string;
    overallStatus: 'initializing' | 'running' | 'completed' | 'error' | 'paused' | 'cancelled';
    currentStep: number;
    totalSteps: number;
    steps: RealtimeExecutionStep[];
    startTime: number;
    endTime?: number;
    estimatedTimeRemaining?: number;
    metadata?: {
        priority: 'low' | 'medium' | 'high' | 'critical';
        requester: string;
        environment: string;
        version: string;
    };
}
interface ClientWebSocketRoom {
    id: string;
    name: string;
    type: 'public' | 'private' | 'direct' | 'group';
    memberCount: number;
    joinedAt: number;
    lastActivity: number;
    messageCount: number;
    unreadCount: number;
    metadata?: {
        description?: string;
        tags?: string[];
        permissions?: {
            canSend: boolean;
            canInvite: boolean;
            canLeave: boolean;
        };
    };
}
interface ClientMessage {
    id: string;
    type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system' | 'agent';
    content: any;
    sender: {
        id: string;
        name: string;
        type: 'user' | 'agent' | 'system';
        avatar?: string;
    };
    room: string;
    timestamp: number;
    edited?: boolean;
    editedAt?: number;
    reactions?: {
        emoji: string;
        count: number;
        users: string[];
    }[];
    metadata?: {
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        expiresAt?: number;
        encrypted?: boolean;
        fileInfo?: {
            name: string;
            size: number;
            type: string;
            url: string;
        };
    };
}
interface StreamConfig {
    streamId: string;
    type: 'text' | 'binary' | 'json' | 'media' | 'agent-output';
    compression?: boolean;
    encryption?: boolean;
    chunkSize?: number;
    bufferSize?: number;
    qualityOfService?: 'best-effort' | 'guaranteed' | 'real-time';
    metadata?: {
        source: string;
        target?: string;
        contentType?: string;
        totalSize?: number;
    };
}
interface StreamChunk {
    streamId: string;
    sequenceNumber: number;
    data: any;
    isLast: boolean;
    timestamp: number;
    checksum?: string;
}
interface CollaborationSession {
    sessionId: string;
    type: 'document' | 'whiteboard' | 'code' | 'design' | 'meeting' | 'agent-task';
    participants: {
        id: string;
        name: string;
        role: 'owner' | 'editor' | 'viewer' | 'agent';
        joinedAt: number;
        lastActivity: number;
        cursor?: {
            x: number;
            y: number;
            element?: string;
        };
    }[];
    document?: {
        id: string;
        version: number;
        content: any;
        lastModified: number;
        modifiedBy: string;
    };
    locks?: {
        elementId: string;
        lockedBy: string;
        lockedAt: number;
        expiresAt: number;
    }[];
    status: 'active' | 'paused' | 'completed' | 'archived';
    createdAt: number;
    lastActivity: number;
}
interface ConnectionStatus {
    connected: boolean;
    environment: string;
    socketId?: string;
    connectionTime?: number;
    reconnectCount: number;
    lastError?: string;
    latency?: number;
    serverVersion?: string;
    protocolVersion?: string;
}
interface WebSocketEvents {
    'connected': {
        socketId: string;
        timestamp: number;
    };
    'disconnected': {
        reason: string;
        timestamp: number;
    };
    'reconnected': {
        attemptNumber: number;
        timestamp: number;
    };
    'connection-error': {
        error: string;
        timestamp: number;
    };
    'room-joined': {
        roomId: string;
        roomName: string;
        memberCount: number;
    };
    'room-left': {
        roomId: string;
    };
    'user-joined': {
        roomId: string;
        userId: string;
        userInfo?: any;
    };
    'user-left': {
        roomId: string;
        userId: string;
    };
    'message': ClientMessage;
    'message-sent': {
        event: string;
        data: any;
        timestamp: number;
    };
    'message-queued': {
        message: any;
        queueSize: number;
    };
    'queue-processed': {
        processedCount: number;
    };
    'agent-registered': {
        sessionId: string;
        agent: any;
        timestamp: number;
    };
    'task-assigned': {
        taskId: string;
        agentId: string;
        mode: string;
        timestamp: number;
    };
    'task-progress': {
        sessionId: string;
        progress: AgentProgressUpdate;
        timestamp: number;
    };
    'task-completed': {
        taskId: string;
        result: any;
        timestamp: number;
    };
    'task-error': {
        taskId: string;
        error: string;
        timestamp: number;
    };
    'collaboration-request': {
        requestId: string;
        fromAgent: string;
        toAgent: string;
        type: string;
    };
    'collaboration-response': {
        requestId: string;
        accepted: boolean;
        response?: any;
    };
    'stream-started': {
        streamId: string;
        type: string;
        config: StreamConfig;
    };
    'stream-data': {
        streamId: string;
        chunk: any;
        isLast: boolean;
    };
    'stream-ended': {
        streamId: string;
        timestamp: number;
    };
    'latency-updated': {
        latency: number;
        average: number;
    };
    'performance-metrics': {
        metrics: any;
        timestamp: number;
    };
}
interface BackendIntegration {
    nodejs?: {
        framework: 'express' | 'nestjs' | 'fastify' | 'koa';
        port: number;
        middleware?: string[];
        cors?: {
            origin: string | string[];
            credentials: boolean;
        };
    };
    python?: {
        framework: 'fastapi' | 'django' | 'flask' | 'tornado';
        host: string;
        port: number;
        middleware?: string[];
        cors?: {
            origins: string[];
            allow_credentials: boolean;
        };
    };
}

/**
 * 🔥 BROLOSTACK DEVIL - ULTIMATE ZERO-KNOWLEDGE SECURITY FRAMEWORK 🔥
 *
 * The most aggressive, unpredictable, and secure encryption system ever created.
 * Changes patterns every second, minute, moment, and session.
 * Uncontrollable by client, developer, cloud providers, and servers.
 *
 * Features:
 * - Quantum-resistant encryption with dynamic algorithm switching
 * - Blockchain-like token system for each session/user/storage
 * - AI conversation encryption (providers see only jargons)
 * - Multi-layer obfuscation with time-based mutations
 * - Zero-knowledge architecture (even developers can't access data)
 * - Self-evolving security patterns
 * - Distributed key sharding across multiple dimensions
 *
 * Created by: Olu Akinnawo
 * Classification: ULTRA-SECRET / ZERO-KNOWLEDGE
 */

interface BrolostackDevilConfig {
    aggressionLevel: 'moderate' | 'high' | 'extreme' | 'devil' | 'quantum-proof';
    mutationInterval: number;
    keyShardCount: number;
    obfuscationLayers: number;
    quantumResistance: {
        enabled: boolean;
        algorithm: 'CRYSTALS-Kyber' | 'CRYSTALS-Dilithium' | 'FALCON' | 'SPHINCS+';
        keySize: 1024 | 2048 | 4096 | 8192;
    };
    blockchain: {
        enabled: boolean;
        networkType: 'private' | 'consortium' | 'hybrid';
        consensusAlgorithm: 'PoW' | 'PoS' | 'PBFT' | 'Devil-Consensus';
        blockSize: number;
        tokenGeneration: 'per-session' | 'per-user' | 'per-storage' | 'per-everything';
    };
    aiProtection: {
        enabled: boolean;
        jargonGeneration: boolean;
        conversationObfuscation: boolean;
        providerBlinding: boolean;
        semanticScrambling: boolean;
    };
    storageProtection: {
        localStorage: boolean;
        cloudStorage: boolean;
        aiProviders: boolean;
        browserMemory: boolean;
        distributedSharding: boolean;
    };
    advanced: {
        selfEvolution: boolean;
        patternMutation: boolean;
        timeBasedKeys: boolean;
        biometricBinding: boolean;
        deviceFingerprinting: boolean;
        quantumEntanglement: boolean;
    };
}
declare enum DevilSecurityLevel {
    MODERATE = 1,
    HIGH = 2,
    EXTREME = 3,
    DEVIL = 4,
    QUANTUM_PROOF = 5,
    INTERDIMENSIONAL = 6
}
declare enum DevilEncryptionAlgorithm {
    AES_256_GCM = "AES-256-GCM",
    CHACHA20_POLY1305 = "ChaCha20-Poly1305",
    SERPENT_256 = "Serpent-256",
    TWOFISH_256 = "Twofish-256",
    CRYSTALS_KYBER = "CRYSTALS-Kyber",
    CRYSTALS_DILITHIUM = "CRYSTALS-Dilithium",
    FALCON = "FALCON",
    SPHINCS_PLUS = "SPHINCS+",
    DEVIL_CIPHER = "Devil-Cipher",
    QUANTUM_DEVIL = "Quantum-Devil",
    INTERDIMENSIONAL_CIPHER = "Interdimensional-Cipher"
}
interface DevilBlockchainToken {
    id: string;
    type: 'session' | 'user' | 'storage' | 'ai-conversation' | 'universal';
    value: string;
    timestamp: number;
    expiresAt: number;
    signature: string;
    merkleRoot: string;
    nonce: number;
    difficulty: number;
    previousHash: string;
    metadata: {
        securityLevel: DevilSecurityLevel;
        algorithm: DevilEncryptionAlgorithm;
        keyShards: string[];
        obfuscationSeed: string;
    };
}
interface DevilEncryptionResult {
    encryptedData: string;
    token: DevilBlockchainToken;
    keyShards: string[];
    obfuscationMap: Record<string, any>;
    mutationSeed: string;
    timestamp: number;
    securityFingerprint: string;
    quantumSignature?: string | undefined;
}
declare class BrolostackDevil extends EventEmitter {
    private config;
    private logger;
    private currentAlgorithm;
    private securityLevel;
    private mutationTimer?;
    private keyShards;
    private blockchainTokens;
    private obfuscationPatterns;
    private quantumKeys;
    private algorithmArsenal;
    constructor(config?: Partial<BrolostackDevilConfig>);
    /**
     * 🔥 Create devil-level configuration
     */
    private createDevilConfig;
    /**
     * 🔥 ULTIMATE CLIENT-SIDE ENCRYPTION
     * Zero-knowledge encryption that even developers can't access
     */
    encryptClientData(data: any, userSecret: string, context: {
        userId: string;
        sessionId: string;
        dataType: 'message' | 'document' | 'ai-conversation' | 'storage' | 'universal';
    }): Promise<DevilEncryptionResult>;
    /**
     * 🔥 ULTIMATE CLIENT-SIDE DECRYPTION
     * Only the user with the original secret can decrypt
     */
    decryptClientData(encryptionResult: DevilEncryptionResult, userSecret: string, context: {
        userId: string;
        sessionId: string;
        dataType: 'message' | 'document' | 'ai-conversation' | 'storage' | 'universal';
    }): Promise<any>;
    /**
     * 🔥 AI CONVERSATION ENCRYPTION
     * Providers see only jargons and machine language
     */
    encryptAIConversation(conversation: {
        messages: {
            role: 'user' | 'assistant';
            content: string;
        }[];
        metadata?: any;
    }, userSecret: string, aiProvider: string): Promise<{
        encryptedConversation: any;
        providerPayload: any;
        devilToken: DevilBlockchainToken;
    }>;
    /**
     * 🔥 BLOCKCHAIN TOKEN GENERATION
     * Creates unique tokens for each session/user/storage/everything
     */
    private generateBlockchainToken;
    /**
     * 🔥 USER KEY DERIVATION (NEVER STORED ON SERVER)
     * Uses advanced key derivation with biometric and device binding
     */
    private deriveUserKey;
    /**
     * 🔥 KEY SHARDING ACROSS MULTIPLE DIMENSIONS
     * Splits key into multiple shards stored in different locations
     */
    private shardKey;
    /**
     * 🔥 DEVIL ENCRYPTION WITH DYNAMIC ALGORITHMS
     */
    private devilEncrypt;
    /**
     * 🔥 DEVIL DECRYPTION
     */
    private devilDecrypt;
    /**
     * 🔥 AI JARGON GENERATION
     * Converts real conversation to meaningless jargon for AI providers
     */
    private generateAIJargonPayload;
    /**
     * 🔥 SEMANTIC JARGON GENERATION
     * Converts meaningful text to meaningless but grammatically correct jargon
     */
    private generateSemanticJargon;
    /**
     * 🔥 MUTATION CYCLE - CHANGES PATTERNS EVERY INTERVAL
     */
    private startMutationCycle;
    /**
     * 🔥 MUTATE SECURITY PATTERNS
     * Changes encryption patterns unpredictably
     */
    private mutateSecurityPatterns;
    /**
     * 🔥 HELPER METHODS
     */
    private getSecurityLevel;
    private selectRandomAlgorithm;
    private generateSecureNonce;
    private calculateDifficulty;
    private mineToken;
    private meetsDifficulty;
    private getTokenType;
    /**
     * 🔥 CRYPTOGRAPHIC PRIMITIVES
     */
    private hash;
    private generateSecureRandom;
    private aes256GcmEncrypt;
    private aes256GcmDecrypt;
    /**
     * 🔥 DEVIL'S CUSTOM CIPHER
     * Proprietary encryption algorithm that changes with each mutation
     */
    private devilCipherEncrypt;
    private devilCipherDecrypt;
    /**
     * 🔥 QUANTUM-RESISTANT ENCRYPTION
     */
    private quantumDevilEncrypt;
    /**
     * 🔥 BROWSER STORAGE PROTECTION
     * Encrypts data in localStorage, sessionStorage, IndexedDB
     */
    protectBrowserStorage(key: string, value: any, storageType: 'localStorage' | 'sessionStorage' | 'indexedDB'): Promise<void>;
    /**
     * 🔥 RETRIEVE PROTECTED BROWSER DATA
     */
    retrieveProtectedBrowserData(key: string, storageType: 'localStorage' | 'sessionStorage' | 'indexedDB'): Promise<any>;
    /**
     * 🔥 CLOUD STORAGE PROTECTION
     * Encrypts data before sending to any cloud provider
     */
    protectCloudStorage(data: any, userSecret: string, cloudProvider: string, userId: string): Promise<{
        encryptedPayload: any;
        retrievalToken: string;
    }>;
    /**
     * 🔥 DEVICE FINGERPRINTING
     */
    private generateDeviceFingerprint;
    private generateBrowserSecret;
    /**
     * 🔥 OBFUSCATION METHODS
     */
    private applyObfuscationLayers;
    private removeObfuscationLayers;
    /**
     * 🔥 UTILITY METHODS
     */
    private bytesToHex;
    private hexToBytes;
    /**
     * 🔥 PUBLIC API METHODS
     */
    /**
     * Get current devil status
     */
    getDevilStatus(): {
        securityLevel: DevilSecurityLevel;
        currentAlgorithm: DevilEncryptionAlgorithm;
        mutationInterval: number;
        activeTokens: number;
        quantumResistance: boolean;
        lastMutation: number;
    };
    /**
     * Force immediate pattern mutation
     */
    forceMutation(): Promise<void>;
    /**
     * Destroy the devil (cleanup)
     */
    destroy(): void;
    private chacha20Encrypt;
    private chacha20Decrypt;
    private quantumDevilDecrypt;
    private latticeBasedEncrypt;
    private hashBasedEncrypt;
    private codeBasedEncrypt;
    private quantumEntanglementEncrypt;
    private generateDynamicKey;
    private generateTokenSBox;
    private substituteBytes;
    private permuteBytes;
    private generateInverseSBox;
    private reversePermuteBytes;
    private memoryHardDerivation;
    private xorWithSeed;
    private xorEncrypt;
    private reconstructKeyFromShards;
    private reconstructKeyShards;
    private applyObfuscationLayer;
    private removeObfuscationLayer;
    private generateObfuscationMap;
    private generateMutationSeed;
    private generateSecurityFingerprint;
    private generateQuantumSignature;
    private verifyQuantumSignature;
    private verifyBlockchainToken;
    private getPreviousHash;
    private generateKeyShardHashes;
    private generateObfuscationSeed;
    private signToken;
    private generateMerkleRoot;
    private generateJargonDictionary;
    private generateRandomJargon;
    private generateFakeMetadata;
    private generateObfuscationPattern;
    private rotateQuantumKeys;
    private storeShardInIndexedDB;
    private distributeShardToBrowser;
    private storeInIndexedDB;
    private retrieveFromIndexedDB;
    private initializeQuantumResistance;
    private generateInitialTokens;
    private generateUserHash;
    private fallbackEncrypt;
    private fallbackDecrypt;
    private applyTokenObfuscation;
    private removeTokenObfuscation;
}
/**
 * 🔥 GET OR CREATE DEVIL INSTANCE
 */
declare function getBrolostackDevil(config?: Partial<BrolostackDevilConfig>): BrolostackDevil;
/**
 * 🔥 DEVIL UTILITIES FOR EASY USAGE
 */
declare const Devil: {
    /**
     * Encrypt any data with devil-level security
     */
    encrypt: (data: any, userSecret: string, context: any) => Promise<DevilEncryptionResult>;
    /**
     * Decrypt devil-encrypted data
     */
    decrypt: (encryptionResult: DevilEncryptionResult, userSecret: string, context: any) => Promise<any>;
    /**
     * Protect AI conversations
     */
    protectAI: (conversation: any, userSecret: string, aiProvider: string) => Promise<{
        encryptedConversation: any;
        providerPayload: any;
        devilToken: DevilBlockchainToken;
    }>;
    /**
     * Protect browser storage
     */
    protectStorage: (key: string, value: any, storageType: "localStorage" | "sessionStorage" | "indexedDB") => Promise<void>;
    /**
     * Retrieve protected data
     */
    retrieveProtected: (key: string, storageType: "localStorage" | "sessionStorage" | "indexedDB") => Promise<any>;
    /**
     * Get devil status
     */
    status: () => {
        securityLevel: DevilSecurityLevel;
        currentAlgorithm: DevilEncryptionAlgorithm;
        mutationInterval: number;
        activeTokens: number;
        quantumResistance: boolean;
        lastMutation: number;
    };
    /**
     * Force security mutation
     */
    mutate: () => Promise<void>;
};

/**
 * 🔥 BROLOSTACK DEVIL SOURCE CODE PROTECTION 🔥
 *
 * The most aggressive source code obfuscation and protection system ever created.
 * Makes your code completely unreadable and unreplicatable by bots and competitors.
 *
 * Features:
 * - Real-time code obfuscation and mutation
 * - Dynamic variable/function name scrambling
 * - Jargon injection and nonsense code generation
 * - Multi-layer code encryption
 * - Browser DevTools protection
 * - Source code hiding from inspect element
 * - Anti-debugging and anti-reverse engineering
 * - Works with React, TypeScript, Node.js, Python, and all frameworks
 *
 * Created by: Olu Akinnawo
 * Classification: ULTRA-SECRET / SOURCE-PROTECTION
 */

interface BrolostackDevilSourceCodeConfig {
    protectionLevel: 'basic' | 'advanced' | 'extreme' | 'devil' | 'impossible';
    obfuscation: {
        enabled: boolean;
        variableNameLength: number;
        functionNameLength: number;
        stringEncryption: boolean;
        controlFlowFlattening: boolean;
        deadCodeInjection: boolean;
        antiDebug: boolean;
    };
    mutation: {
        enabled: boolean;
        interval: number;
        intensity: 'low' | 'medium' | 'high' | 'extreme';
        randomSeed: boolean;
    };
    browserProtection: {
        disableDevTools: boolean;
        disableRightClick: boolean;
        disableKeyboardShortcuts: boolean;
        disableTextSelection: boolean;
        clearConsole: boolean;
        detectDevTools: boolean;
    };
    jargonGeneration: {
        enabled: boolean;
        density: number;
        languages: ('english' | 'spanish' | 'french' | 'german' | 'chinese' | 'arabic' | 'nonsense' | 'technical')[];
        technicalTerms: boolean;
        randomComments: boolean;
    };
    frameworks: {
        react: boolean;
        typescript: boolean;
        nodejs: boolean;
        python: boolean;
        express: boolean;
        fastapi: boolean;
        django: boolean;
        flask: boolean;
    };
    advanced: {
        virtualMachine: boolean;
        codeEncryption: boolean;
        dynamicLoading: boolean;
        proxyObfuscation: boolean;
        memoryProtection: boolean;
    };
}
interface DevilObfuscationResult {
    originalCode: string;
    obfuscatedCode: string;
    sourceMap: Record<string, string>;
    jargonMap: Record<string, string>;
    protectionLevel: string;
    timestamp: number;
    mutationSeed: string;
}
declare class BrolostackDevilSourceCode extends EventEmitter {
    private config;
    private logger;
    private obfuscationMap;
    private jargonMap;
    private mutationTimer?;
    private originalCode;
    private protectedElements;
    private obfuscationPatterns;
    constructor(config?: Partial<BrolostackDevilSourceCodeConfig>);
    /**
     * 🔥 CREATE DEVIL SOURCE CODE CONFIGURATION
     */
    private createDevilConfig;
    /**
     * 🔥 ULTIMATE SOURCE CODE OBFUSCATION
     * Makes code completely unreadable and unreplicatable
     */
    obfuscateSourceCode(code: string, language?: 'javascript' | 'typescript' | 'python' | 'html' | 'php' | 'css' | 'postcss'): Promise<DevilObfuscationResult>;
    /**
     * 🔥 BROWSER DEVTOOLS PROTECTION
     * Prevents inspection and debugging
     */
    private initializeBrowserProtection;
    /**
     * 🔥 DEVELOPER TOOLS DETECTION
     */
    private startDevToolsDetection;
    /**
     * 🔥 HANDLE DEVELOPER TOOLS DETECTION
     */
    private handleDevToolsDetection;
    /**
     * 🔥 VARIABLE NAME OBFUSCATION
     */
    private applyVariableObfuscation;
    /**
     * 🔥 FUNCTION NAME OBFUSCATION
     */
    private applyFunctionObfuscation;
    /**
     * 🔥 STRING ENCRYPTION
     */
    private applyStringEncryption;
    /**
     * 🔥 CONTROL FLOW FLATTENING
     */
    private applyControlFlowFlattening;
    /**
     * 🔥 DEAD CODE INJECTION
     */
    private injectDeadCode;
    /**
     * 🔥 ANTI-DEBUG CODE INJECTION
     */
    private addAntiDebugCode;
    /**
     * 🔥 JARGON GENERATION
     */
    private applyJargonGeneration;
    /**
     * 🔥 INJECT RANDOM COMMENTS
     */
    private injectRandomComments;
    /**
     * 🔥 CODE BLOCK ENCRYPTION
     */
    private encryptCodeBlocks;
    /**
     * 🔥 PROXY OBFUSCATION
     */
    private addProxyObfuscation;
    /**
     * 🔥 HTML OBFUSCATION
     */
    private obfuscateHTML;
    /**
     * 🔥 PHP OBFUSCATION
     */
    private obfuscatePHP;
    /**
     * 🔥 CSS OBFUSCATION
     */
    private obfuscateCSS;
    /**
     * 🔥 CSS CONTENT OBFUSCATION HELPER
     */
    private obfuscateCSSContent;
    /**
     * 🔥 FRAMEWORK-SPECIFIC INTEGRATIONS
     */
    private setupFrameworkIntegrations;
    /**
     * 🔥 REACT INTEGRATION
     */
    private setupReactIntegration;
    /**
     * 🔥 NODE.JS INTEGRATION
     */
    private setupNodeJSIntegration;
    /**
     * 🔥 CODE MUTATION SYSTEM
     */
    private startCodeMutation;
    /**
     * 🔥 MUTATE PROTECTED CODE
     */
    private mutateProtectedCode;
    /**
     * 🔥 BACKEND FRAMEWORK INTEGRATIONS
     */
    /**
     * Express.js Integration
     */
    createExpressMiddleware(): (_req: any, res: any, next: any) => void;
    /**
     * FastAPI Integration (Python)
     */
    createFastAPIMiddleware(): string;
    /**
     * Django Integration (Python)
     */
    createDjangoMiddleware(): string;
    /**
     * 🔥 UTILITY METHODS
     */
    private generateObfuscatedName;
    private generateRandomNames;
    private encryptString;
    private getJSDecryptFunction;
    private getPythonDecryptFunction;
    private generateCodeId;
    private generateMutationSeed;
    private generateJargonString;
    private generateFakeIP;
    private showFakeError;
    private injectFakeConsoleErrors;
    /**
     * 🔥 PUBLIC API METHODS
     */
    /**
     * Obfuscate JavaScript/TypeScript code
     */
    protectJavaScript(code: string): Promise<DevilObfuscationResult>;
    /**
     * Obfuscate TypeScript code
     */
    protectTypeScript(code: string): Promise<DevilObfuscationResult>;
    /**
     * Obfuscate Python code
     */
    protectPython(code: string): Promise<DevilObfuscationResult>;
    /**
     * Obfuscate HTML code
     */
    protectHTML(code: string): Promise<DevilObfuscationResult>;
    /**
     * Obfuscate PHP code
     */
    protectPHP(code: string): Promise<DevilObfuscationResult>;
    /**
     * Obfuscate CSS code
     */
    protectCSS(code: string): Promise<DevilObfuscationResult>;
    /**
     * Obfuscate PostCSS code
     */
    protectPostCSS(code: string): Promise<DevilObfuscationResult>;
    /**
     * Get protection status
     */
    getProtectionStatus(): {
        protectionLevel: "basic" | "extreme" | "devil" | "advanced" | "impossible";
        obfuscationEnabled: boolean;
        mutationEnabled: boolean;
        browserProtectionActive: boolean;
        protectedElements: number;
        obfuscationMappings: number;
        jargonMappings: number;
    };
    /**
     * Force code mutation
     */
    forceMutation(): Promise<void>;
    /**
     * Destroy protection (cleanup)
     */
    destroy(): void;
}
/**
 * 🔥 GET OR CREATE DEVIL SOURCE CODE INSTANCE
 */
declare function getBrolostackDevilSourceCode(config?: Partial<BrolostackDevilSourceCodeConfig>): BrolostackDevilSourceCode;
/**
 * 🔥 DEVIL SOURCE CODE UTILITIES
 */
declare const DevilSourceCode: {
    /**
     * Protect JavaScript code
     */
    protectJS: (code: string) => Promise<DevilObfuscationResult>;
    /**
     * Protect TypeScript code
     */
    protectTS: (code: string) => Promise<DevilObfuscationResult>;
    /**
     * Protect Python code
     */
    protectPython: (code: string) => Promise<DevilObfuscationResult>;
    /**
     * Protect HTML code
     */
    protectHTML: (code: string) => Promise<DevilObfuscationResult>;
    /**
     * Protect PHP code
     */
    protectPHP: (code: string) => Promise<DevilObfuscationResult>;
    /**
     * Protect CSS code
     */
    protectCSS: (code: string) => Promise<DevilObfuscationResult>;
    /**
     * Protect PostCSS code
     */
    protectPostCSS: (code: string) => Promise<DevilObfuscationResult>;
    /**
     * Create Express middleware
     */
    expressMiddleware: () => (_req: any, res: any, next: any) => void;
    /**
     * Get FastAPI middleware code
     */
    fastAPIMiddleware: () => string;
    /**
     * Get Django middleware code
     */
    djangoMiddleware: () => string;
    /**
     * Get protection status
     */
    status: () => {
        protectionLevel: "basic" | "extreme" | "devil" | "advanced" | "impossible";
        obfuscationEnabled: boolean;
        mutationEnabled: boolean;
        browserProtectionActive: boolean;
        protectedElements: number;
        obfuscationMappings: number;
        jargonMappings: number;
    };
    /**
     * Force mutation
     */
    mutate: () => Promise<void>;
};

interface DevilBuildPluginOptions {
    enabled?: boolean;
    protectionLevel?: 'basic' | 'advanced' | 'extreme' | 'devil' | 'impossible';
    filePatterns?: string[];
    excludePatterns?: string[];
    frameworks?: {
        react?: boolean;
        typescript?: boolean;
        nodejs?: boolean;
        python?: boolean;
    };
    outputSourceMaps?: boolean;
    logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
}
/**
 * 🔥 WEBPACK PLUGIN
 */
declare class BrolostackDevilWebpackPlugin {
    private options;
    private logger;
    constructor(options?: DevilBuildPluginOptions);
    apply(compiler: any): void;
    private shouldProtectFile;
    private matchPattern;
    private getFileType;
    private protectSourceCode;
    private generateSourceMapMappings;
}
/**
 * 🔥 VITE PLUGIN
 */
declare function brolostackDevilVitePlugin(options?: DevilBuildPluginOptions): {
    name: string;
    generateBundle(_outputOptions: any, bundle: any): Promise<void>;
};
/**
 * 🔥 ROLLUP PLUGIN
 */
declare function brolostackDevilRollupPlugin(options?: DevilBuildPluginOptions): {
    name: string;
    generateBundle(_outputOptions: any, bundle: any): Promise<void>;
};
/**
 * 🔥 PARCEL PLUGIN
 */
declare class BrolostackDevilParcelPlugin {
    private options;
    private logger;
    constructor(options?: DevilBuildPluginOptions);
    transform(asset: any): Promise<any>;
}
/**
 * 🔥 NEXT.JS PLUGIN
 */
declare function brolostackDevilNextPlugin(nextConfig?: any): any;
/**
 * 🔥 CREATE-REACT-APP INTEGRATION
 */
declare function createReactAppDevil(): {
    webpack: {
        plugins: {
            add: BrolostackDevilWebpackPlugin[];
        };
    };
};
/**
 * 🔥 BABEL PLUGIN
 */
declare function brolostackDevilBabelPlugin(): {
    name: string;
    visitor: {
        Program: {
            exit(path: any): void;
        };
        FunctionDeclaration(path: any): void;
        VariableDeclarator(path: any): void;
    };
};
/**
 * 🔥 CLI TOOL FOR STANDALONE PROTECTION
 */
declare class DevilCLI {
    static protectFile(inputPath: string, outputPath: string, options?: DevilBuildPluginOptions): Promise<DevilObfuscationResult>;
    static protectDirectory(inputDir: string, outputDir: string, options?: DevilBuildPluginOptions): Promise<string[]>;
    private static getFilesRecursively;
}

interface BrolostackDevilContextType {
    devil: BrolostackDevil;
    securityLevel: DevilSecurityLevel;
    isActive: boolean;
    encrypt: (data: any, userSecret: string, context: any) => Promise<DevilEncryptionResult>;
    decrypt: (encryptionResult: DevilEncryptionResult, userSecret: string, context: any) => Promise<any>;
    protectAI: (conversation: any, userSecret: string, aiProvider: string) => Promise<any>;
    protectStorage: (key: string, value: any, storageType: 'localStorage' | 'sessionStorage' | 'indexedDB') => Promise<void>;
    retrieveProtected: (key: string, storageType: 'localStorage' | 'sessionStorage' | 'indexedDB') => Promise<any>;
    forceMutation: () => Promise<void>;
    getStatus: () => any;
}
interface BrolostackDevilProviderProps {
    children: ReactNode;
    config?: Partial<BrolostackDevilConfig>;
    userSecret?: string;
    enableAutoProtection?: boolean;
}
declare function BrolostackDevilProvider({ children, config, userSecret, enableAutoProtection }: BrolostackDevilProviderProps): react_jsx_runtime.JSX.Element;
/**
 * 🔥 Hook for using Brolostack Devil
 */
declare function useBrolostackDevil(): BrolostackDevilContextType;
/**
 * 🔥 Hook for protected state management
 */
declare function useDevilProtectedState<T>(initialValue: T, _userSecret: string, storageKey?: string): readonly [T, (newValue: T) => Promise<void>, boolean];
/**
 * 🔥 Hook for AI conversation protection
 */
declare function useDevilProtectedAI(aiProvider: string, userSecret: string): {
    protectConversation: (conversation: any, conversationId: string) => Promise<any>;
    getProtectedConversation: (conversationId: string) => any;
    protectedCount: number;
};
/**
 * 🔥 Hook for cloud storage protection
 */
declare function useDevilCloudProtection(cloudProvider: string, userId: string): {
    protectForCloud: (data: any, userSecret: string) => Promise<{
        encryptedPayload: any;
        retrievalToken: string;
    }>;
    retrieveFromCloud: (encryptedPayload: any, retrievalToken: string, userSecret: string) => Promise<any>;
};
/**
 * 🔥 Hook for monitoring devil activity
 */
declare function useDevilMonitoring(): {
    stats: any;
    events: any[];
    eventCount: number;
};

interface TokenUsageConfig {
    controlLevel: 'basic' | 'strict' | 'aggressive';
    limits: {
        maxInputTokensPerRequest: number;
        maxOutputTokensPerRequest: number;
        maxTotalTokensPerUser: number;
        maxTotalTokensPerSession: number;
        maxTokensPerMinute: number;
        maxTokensPerHour: number;
        maxTokensPerDay: number;
    };
    monitoring: {
        realTimeTracking: boolean;
        clientSideEnforcement: boolean;
        backendValidation: boolean;
        automaticCutoff: boolean;
        warningThresholds: {
            input: number;
            output: number;
            total: number;
        };
    };
    costManagement: {
        enabled: boolean;
        maxCostPerRequest: number;
        maxCostPerUser: number;
        maxCostPerDay: number;
        currency: 'USD' | 'EUR' | 'GBP';
        providerPricing: Record<string, {
            inputTokenPrice: number;
            outputTokenPrice: number;
        }>;
    };
    actions: {
        warnUser: boolean;
        blockRequest: boolean;
        truncateInput: boolean;
        limitOutput: boolean;
        logViolation: boolean;
        notifyDeveloper: boolean;
    };
}
interface TokenUsageMetrics {
    session: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        requestCount: number;
        estimatedCost: number;
    };
    user: {
        totalInputTokens: number;
        totalOutputTokens: number;
        totalRequests: number;
        totalCost: number;
        lastReset: number;
    };
    realTime: {
        currentInputTokens: number;
        currentOutputTokens: number;
        streamingTokens: number;
        projectedTotal: number;
    };
    limits: {
        inputRemaining: number;
        outputRemaining: number;
        totalRemaining: number;
        percentageUsed: number;
    };
}
interface TokenControlResult {
    allowed: boolean;
    reason?: string | undefined;
    adjustedLimits?: {
        maxInputTokens: number;
        maxOutputTokens: number;
    };
    warnings: string[];
    metrics: TokenUsageMetrics;
    costEstimate: number;
    recommendedAction: 'proceed' | 'warn' | 'limit' | 'block';
}
interface BSDGFConfig {
    tokenUsage: TokenUsageConfig;
    safetyCompliance: {
        hallucinationDetection: {
            enabled: boolean;
            sensitivity: 'low' | 'medium' | 'high' | 'maximum';
            factCheckingLevel: 'basic' | 'advanced' | 'comprehensive';
            realTimeValidation: boolean;
        };
        jailbreakDetection: {
            enabled: boolean;
            patterns: string[];
            behaviorAnalysis: boolean;
            contextualAwareness: boolean;
        };
        toxicLanguageDetection: {
            enabled: boolean;
            categories: ('hate' | 'harassment' | 'violence' | 'sexual' | 'self-harm' | 'profanity')[];
            threshold: number;
            multilingual: boolean;
        };
        privacyCompliance: {
            enabled: boolean;
            regulations: ('GDPR' | 'CCPA' | 'HIPAA' | 'SOX' | 'PCI-DSS' | 'FERPA')[];
            piiDetection: boolean;
            dataMinimization: boolean;
        };
        nationalCompliance: {
            enabled: boolean;
            countries: string[];
            legalFrameworks: string[];
            culturalSensitivity: boolean;
        };
    };
    functionalReadiness: {
        contextDrift: {
            enabled: boolean;
            maxDriftThreshold: number;
            contextWindowTracking: boolean;
            semanticCoherence: boolean;
        };
        toneMismatch: {
            enabled: boolean;
            expectedTone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical' | 'adaptive';
            toneConsistency: boolean;
            audienceAwareness: boolean;
        };
        industryReadiness: {
            enabled: boolean;
            industries: ('healthcare' | 'finance' | 'legal' | 'education' | 'technology' | 'retail')[];
            domainExpertise: boolean;
            terminologyAccuracy: boolean;
        };
        robustnessReliability: {
            enabled: boolean;
            stressTestingLevel: 'basic' | 'advanced' | 'extreme';
            edgeCaseHandling: boolean;
            errorRecovery: boolean;
        };
        explainabilityTransparency: {
            enabled: boolean;
            reasoningLevel: 'basic' | 'detailed' | 'comprehensive';
            decisionTracing: boolean;
            confidenceScoring: boolean;
        };
        fraudDetection: {
            enabled: boolean;
            patterns: string[];
            behaviorAnalysis: boolean;
            riskAssessment: boolean;
        };
    };
    advancedDomains: {
        aiAlignment: {
            enabled: boolean;
            humanValues: string[];
            goalAlignment: boolean;
            valueSystemChecking: boolean;
        };
        biasFairness: {
            enabled: boolean;
            biasTypes: ('gender' | 'race' | 'age' | 'religion' | 'nationality' | 'socioeconomic')[];
            fairnessMetrics: ('demographic_parity' | 'equalized_odds' | 'calibration')[];
            mitigationStrategies: boolean;
        };
    };
    actions: {
        blockUnsafeContent: boolean;
        logViolations: boolean;
        alertAdministrators: boolean;
        gradualDegradation: boolean;
        userNotification: boolean;
        automaticCorrection: boolean;
    };
    monitoring: {
        enabled: boolean;
        realTimeScoring: boolean;
        dashboardUpdates: boolean;
        alertThresholds: Record<string, number>;
    };
}
interface BSDGFAssessmentResult {
    overall: {
        score: number;
        status: 'safe' | 'warning' | 'unsafe' | 'blocked';
        confidence: number;
        timestamp: number;
    };
    safetyCompliance: {
        hallucination: {
            detected: boolean;
            confidence: number;
            details: string[];
        };
        jailbreak: {
            detected: boolean;
            confidence: number;
            patterns: string[];
        };
        toxicLanguage: {
            detected: boolean;
            categories: string[];
            severity: number;
        };
        privacyCompliance: {
            violations: string[];
            score: number;
        };
        nationalCompliance: {
            violations: string[];
            countries: string[];
        };
    };
    functionalReadiness: {
        contextDrift: {
            score: number;
            driftAmount: number;
        };
        toneMismatch: {
            score: number;
            expectedTone: string;
            actualTone: string;
        };
        industryReadiness: {
            score: number;
            industry: string;
            expertise: number;
        };
        robustness: {
            score: number;
            reliability: number;
        };
        explainability: {
            score: number;
            reasoningQuality: number;
        };
        fraudDetection: {
            riskScore: number;
            indicators: string[];
        };
    };
    advancedDomains: {
        aiAlignment: {
            score: number;
            alignmentIssues: string[];
        };
        biasFairness: {
            score: number;
            biasDetected: string[];
            fairnessScore: number;
        };
    };
    recommendations: string[];
    actions: string[];
}
interface GovernedAIResponse {
    originalResponse: string;
    governanceResult: BSDGFAssessmentResult;
    safeResponse: string;
    metadata: {
        provider: string;
        model: string;
        timestamp: number;
        processingTime: number;
        governanceVersion: string;
    };
}
declare class TokenUsageManager extends EventEmitter {
    private config;
    private logger;
    private userMetrics;
    private sessionMetrics;
    private realtimeTracking;
    constructor(config: TokenUsageConfig);
    /**
     * 💰 VALIDATE TOKEN USAGE BEFORE REQUEST
     */
    validateTokenUsage(userId: string, sessionId: string, inputText: string, provider: string, model: string, requestedMaxTokens?: number): Promise<TokenControlResult>;
    /**
     * 💰 TRACK REAL-TIME TOKEN USAGE DURING STREAMING
     */
    trackStreamingTokens(userId: string, sessionId: string, streamChunk: string, isComplete?: boolean): TokenUsageMetrics;
    /**
     * 💰 UPDATE METRICS AFTER COMPLETION
     */
    updateTokenUsage(userId: string, sessionId: string, inputTokens: number, outputTokens: number, provider: string, model: string): void;
    /**
     * 💰 CHECK TOKEN LIMITS
     */
    private checkTokenLimits;
    /**
     * 💰 APPLY CONTROL LEVEL ENFORCEMENT
     */
    private applyControlLevel;
    /**
     * 💰 SHOULD CUTOFF STREAMING
     */
    private shouldCutoffStreaming;
    /**
     * 💰 ESTIMATE TOKEN COUNT
     */
    private estimateTokenCount;
    /**
     * 💰 CALCULATE COST
     */
    private calculateCost;
    /**
     * 💰 GET USER METRICS
     */
    private getUserMetrics;
    /**
     * 💰 GET SESSION METRICS
     */
    private getSessionMetrics;
    /**
     * 💰 CREATE EMPTY METRICS
     */
    private createEmptyMetrics;
    /**
     * 💰 UPDATE USER METRICS
     */
    private updateUserMetrics;
    /**
     * 💰 UPDATE SESSION METRICS
     */
    private updateSessionMetrics;
    /**
     * 💰 GET RECOMMENDED ACTION
     */
    private getRecommendedAction;
    /**
     * 💰 INITIALIZE PRICING CALCULATORS
     */
    private initializePricingCalculators;
    /**
     * 💰 START REALTIME MONITORING
     */
    private startRealtimeMonitoring;
    /**
     * 💰 RESET USER METRICS
     */
    resetUserMetrics(userId: string): void;
    /**
     * 💰 GET TOKEN USAGE STATISTICS
     */
    getUsageStatistics(): {
        totalUsers: number;
        totalSessions: number;
        totalTokensUsed: number;
        totalCost: number;
        averageTokensPerUser: number;
    };
}
declare class BrolostackBSDGF4AI extends EventEmitter {
    private config;
    private logger;
    private assessmentHistory;
    private violationPatterns;
    private industryKnowledge;
    private tokenManager;
    constructor(config?: Partial<BSDGFConfig>);
    /**
     * 🛡️ MAIN GOVERNANCE METHOD
     * Analyzes AI response for safety, compliance, and quality with token control
     */
    governAIResponse(aiResponse: string, context: {
        provider: string;
        model: string;
        userPrompt: string;
        conversationHistory?: any[];
        industry?: string;
        userProfile?: any;
        userId?: string;
        sessionId?: string;
        requestedMaxTokens?: number;
    }): Promise<GovernedAIResponse>;
    /**
     * 💰 TOKEN USAGE VALIDATION (PUBLIC METHOD)
     */
    validateTokenUsage(userId: string, sessionId: string, inputText: string, provider: string, model: string, requestedMaxTokens?: number): Promise<TokenControlResult>;
    /**
     * 💰 TRACK STREAMING TOKENS (PUBLIC METHOD)
     */
    trackStreamingTokens(userId: string, sessionId: string, streamChunk: string, isComplete?: boolean): TokenUsageMetrics;
    /**
     * 💰 GET TOKEN USAGE STATISTICS (PUBLIC METHOD)
     */
    getTokenUsageStatistics(): {
        totalUsers: number;
        totalSessions: number;
        totalTokensUsed: number;
        totalCost: number;
        averageTokensPerUser: number;
    };
    /**
     * 💰 RESET USER TOKEN METRICS (PUBLIC METHOD)
     */
    resetUserTokenMetrics(userId: string): void;
    /**
     * 🛡️ COMPREHENSIVE ASSESSMENT
     */
    private performComprehensiveAssessment;
    /**
     * 🛡️ SAFETY & COMPLIANCE ASSESSMENT
     */
    private assessSafetyCompliance;
    /**
     * 🛡️ HALLUCINATION DETECTION
     */
    private detectHallucinations;
    /**
     * 🛡️ JAILBREAK DETECTION
     */
    private detectJailbreaks;
    /**
     * 🛡️ TOXIC LANGUAGE DETECTION
     */
    private detectToxicLanguage;
    /**
     * 🛡️ PRIVACY COMPLIANCE ASSESSMENT
     */
    private assessPrivacyCompliance;
    /**
     * 🛡️ FUNCTIONAL READINESS ASSESSMENT
     */
    private assessFunctionalReadiness;
    /**
     * 🛡️ CONTEXT DRIFT ASSESSMENT
     */
    private assessContextDrift;
    /**
     * 🛡️ BIAS & FAIRNESS ASSESSMENT
     */
    private assessBiasFairness;
    /**
     * 🛡️ GENERATE SAFE RESPONSE
     */
    private generateSafeResponse;
    /**
     * 🛡️ UTILITY METHODS
     */
    private createDefaultConfig;
    /**
     * 🛡️ GET GOVERNANCE STATUS
     */
    getGovernanceStatus(): {
        enabled: boolean;
        version: string;
        enabledModules: string[];
        assessmentCount: number;
        violationPatterns: number;
        industryKnowledge: number;
        environment: BrolostackEnvironment;
    };
    /**
     * 🛡️ FORCE GOVERNANCE UPDATE
     */
    updateGovernanceRules(): Promise<void>;
    private initializeGovernanceModules;
    private loadIndustryKnowledge;
    private setupBiasDetectors;
    private getEnabledModules;
    private validateFactualClaims;
    private checkContextConsistency;
    private detectPromptInjection;
    private calculateOverallScore;
    private determineStatus;
    private calculateConfidence;
    private generateRecommendations;
    private determineActions;
    private storeAssessment;
    private assessNationalCompliance;
    private assessToneMismatch;
    private assessIndustryReadiness;
    private assessRobustness;
    private assessExplainability;
    private assessFraudDetection;
    private assessAdvancedDomains;
    private extractKeywords;
    private calculateSemanticSimilarity;
    private detectGenderBias;
    private detectRacialBias;
    private detectAgeBias;
    private sanitizeToxicContent;
    private redactPII;
    private addUncertaintyQualifiers;
}
/**
 * 🛡️ GET OR CREATE GOVERNANCE INSTANCE
 */
declare function getBrolostackBSDGF4AI(config?: Partial<BSDGFConfig>): BrolostackBSDGF4AI;
/**
 * 🛡️ GOVERNANCE UTILITIES
 */
declare const AIGovernance: {
    /**
     * Govern AI response with comprehensive safety checks
     */
    govern: (response: string, context: any) => Promise<GovernedAIResponse>;
    /**
     * Quick safety check
     */
    quickCheck: (response: string) => Promise<boolean>;
    /**
     * Get governance status
     */
    status: () => {
        enabled: boolean;
        version: string;
        enabledModules: string[];
        assessmentCount: number;
        violationPatterns: number;
        industryKnowledge: number;
        environment: BrolostackEnvironment;
    };
};

/**
 * 🧠 BROLOSTACK REACT (REASON + ACT) FRAMEWORK
 *
 * Advanced reasoning framework that combines language model reasoning with actionable steps.
 * Enables agent-like systems to think, plan, and execute actions in interactive environments.
 *
 * Created by: Olu Akinnawo
 * Publisher: Beunec Technologies, Inc.
 * Framework: ReAct (Reason + Act)
 */

interface ReActConfig {
    maxIterations: number;
    thoughtDepth: 'shallow' | 'medium' | 'deep' | 'comprehensive';
    actionTimeout: number;
    reasoning: {
        structuredThinking: boolean;
        stepByStepAnalysis: boolean;
        goalDecomposition: boolean;
        contextAwareness: boolean;
    };
    actions: {
        allowedActions: string[];
        toolIntegration: boolean;
        environmentInteraction: boolean;
        safetyChecks: boolean;
    };
    governance: {
        enabled: boolean;
        realTimeChecking: boolean;
        safetyFirst: boolean;
    };
    performance: {
        caching: boolean;
        parallelProcessing: boolean;
        optimizedPrompts: boolean;
    };
}
interface ReActStep {
    iteration: number;
    thought: string;
    action: {
        type: string;
        parameters: Record<string, any>;
        tool?: string;
    };
    observation: string;
    confidence: number;
    timestamp: number;
}
interface ReActResult {
    success: boolean;
    finalAnswer: string;
    reasoning: ReActStep[];
    totalIterations: number;
    executionTime: number;
    confidence: number;
    governanceResult?: GovernedAIResponse | undefined;
    metadata: {
        provider: string;
        model: string;
        thoughtDepth: string;
        actionsExecuted: number;
    };
}
declare class BrolostackReAcT extends EventEmitter {
    private config;
    private logger;
    private availableTools;
    private executionHistory;
    constructor(config?: Partial<ReActConfig>);
    /**
     * 🧠 MAIN REACT EXECUTION
     * Executes reasoning + action cycles until goal is achieved
     */
    execute(query: string, context: {
        provider: string;
        model: string;
        apiKey: string;
        goal?: string;
        environment?: Record<string, any>;
        tools?: string[];
    }): Promise<ReActResult>;
    /**
     * 🧠 GENERATE THOUGHT
     */
    private generateThought;
    /**
     * 🧠 DETERMINE ACTION
     */
    private determineAction;
    /**
     * 🧠 EXECUTE ACTION
     */
    private executeAction;
    /**
     * 🧠 REGISTER TOOL
     */
    registerTool(name: string, toolFunction: Function): void;
    /**
     * 🧠 UTILITY METHODS
     */
    private createDefaultConfig;
    private initializeTools;
    private buildThoughtPrompt;
    private callAIProvider;
    private extractThought;
    private buildActionPrompt;
    private parseAction;
    private executeSearch;
    private executeCalculation;
    private executeAPICall;
    private executeTool;
    private isGoalAchieved;
    private generateFinalAnswer;
    private calculateStepConfidence;
    private calculateOverallConfidence;
    private analyzeSentiment;
}

/**
 * 🧠 BROLOSTACK CHAIN-OF-THOUGHT (COT) FRAMEWORK
 *
 * Advanced reasoning framework that guides AI models to generate step-by-step reasoning
 * for complex tasks, improving accuracy and explainability.
 *
 * Created by: Olu Akinnawo
 * Publisher: Beunec Technologies, Inc.
 * Framework: Chain-of-Thought (CoT)
 */

interface CoTConfig {
    reasoning: {
        stepByStep: boolean;
        showWorkings: boolean;
        logicalProgression: boolean;
        intermediateSteps: boolean;
    };
    prompting: {
        fewShotExamples: boolean;
        exampleCount: number;
        promptTemplate: string;
        reasoningCues: string[];
    };
    quality: {
        stepValidation: boolean;
        logicalConsistency: boolean;
        factualAccuracy: boolean;
        completenessCheck: boolean;
    };
    governance: {
        enabled: boolean;
        stepByStepChecking: boolean;
        finalAnswerValidation: boolean;
    };
    performance: {
        caching: boolean;
        optimizedPrompts: boolean;
        parallelValidation: boolean;
    };
}
interface CoTStep {
    stepNumber: number;
    description: string;
    reasoning: string;
    calculation?: string;
    conclusion: string;
    confidence: number;
    timestamp: number;
}
interface CoTResult {
    success: boolean;
    finalAnswer: string;
    reasoning: CoTStep[];
    totalSteps: number;
    executionTime: number;
    confidence: number;
    governanceResult?: GovernedAIResponse | undefined;
    metadata: {
        provider: string;
        model: string;
        reasoningQuality: number;
        logicalConsistency: number;
    };
}
declare class BrolostackCoT extends EventEmitter {
    private config;
    private logger;
    private reasoningTemplates;
    private executionHistory;
    constructor(config?: Partial<CoTConfig>);
    /**
     * 🧠 MAIN COT EXECUTION
     * Guides AI through step-by-step reasoning process
     */
    execute(query: string, context: {
        provider: string;
        model: string;
        apiKey: string;
        domain?: string;
        complexity?: 'simple' | 'medium' | 'complex' | 'expert';
    }): Promise<CoTResult>;
    /**
     * 🧠 BUILD COT PROMPT
     */
    private buildCoTPrompt;
    /**
     * 🧠 GET REASONING STATISTICS
     */
    getReasoningStatistics(): {
        totalExecutions: number;
        averageSteps: number;
        averageConfidence: number;
        successRate: number;
        averageExecutionTime: number;
    };
    private createDefaultConfig;
    private initializeReasoningTemplates;
    private executeReasoning;
    private parseReasoningSteps;
    private validateReasoningSteps;
    private extractFinalAnswer;
    private calculateOverallConfidence;
    private assessReasoningQuality;
    private assessLogicalConsistency;
    private getFewShotExamples;
}

/**
 * 🧠 BROLOSTACK TREE-OF-THOUGHTS (TOT) FRAMEWORK
 *
 * Advanced reasoning framework that explores multiple reasoning paths simultaneously,
 * allowing for lookahead, backtracking, and comprehensive solution exploration.
 *
 * Created by: Olu Akinnawo
 * Publisher: Beunec Technologies, Inc.
 * Framework: Tree-of-Thoughts (ToT)
 */

interface ToTConfig {
    tree: {
        maxDepth: number;
        maxBranches: number;
        pruningThreshold: number;
        explorationStrategy: 'breadth-first' | 'depth-first' | 'best-first' | 'adaptive';
    };
    thoughtGeneration: {
        thoughtsPerStep: number;
        diversityBonus: boolean;
        creativityLevel: 'conservative' | 'moderate' | 'creative' | 'innovative';
        noveltyDetection: boolean;
    };
    evaluation: {
        evaluationCriteria: string[];
        scoringMethod: 'weighted' | 'average' | 'max' | 'consensus';
        lookaheadDepth: number;
        backtrackingEnabled: boolean;
    };
    search: {
        beamWidth: number;
        searchTimeout: number;
        earlyTermination: boolean;
        solutionThreshold: number;
    };
    governance: {
        enabled: boolean;
        nodeValidation: boolean;
        pathValidation: boolean;
        finalValidation: boolean;
    };
}
interface ThoughtNode {
    id: string;
    depth: number;
    parentId?: string;
    thought: string;
    score: number;
    confidence: number;
    children: string[];
    metadata: {
        timestamp: number;
        evaluationScores: Record<string, number>;
        isTerminal: boolean;
        isPruned: boolean;
    };
}
interface ToTResult {
    success: boolean;
    bestPath: ThoughtNode[];
    finalAnswer: string;
    exploredNodes: number;
    totalPaths: number;
    executionTime: number;
    confidence: number;
    governanceResult?: GovernedAIResponse | undefined;
    metadata: {
        provider: string;
        model: string;
        searchStrategy: string;
        maxDepthReached: number;
        pruningCount: number;
    };
}
declare class BrolostackToT extends EventEmitter {
    private config;
    private logger;
    private thoughtTree;
    private executionHistory;
    constructor(config?: Partial<ToTConfig>);
    /**
     * 🧠 MAIN TOT EXECUTION
     * Explores tree of possible reasoning paths
     */
    execute(query: string, context: {
        provider: string;
        model: string;
        apiKey: string;
        domain?: string;
        constraints?: string[];
        evaluationCriteria?: string[];
    }): Promise<ToTResult>;
    /**
     * 🧠 EXPLORE TREE
     */
    private exploreTree;
    /**
     * 🧠 FIND BEST PATH
     */
    private findBestPath;
    /**
     * 🧠 GET EXPLORATION STATISTICS
     */
    getExplorationStatistics(): {
        totalExecutions: number;
        averageNodesExplored: number;
        averagePathLength: number;
        averageConfidence: number;
        successRate: number;
    };
    private createRootNode;
    private generateChildThoughts;
    private createChildNode;
    private evaluateNode;
    private sortQueue;
    private generateFinalAnswer;
    private calculatePathConfidence;
    private initializeEvaluationFunctions;
    private createDefaultConfig;
}

/**
 * 🧠 BROLOSTACK CHAIN-OF-THOUGHT SELF-CONSISTENCY (COT-SC) FRAMEWORK
 *
 * Advanced reasoning framework that improves CoT reliability by generating multiple
 * independent reasoning paths and selecting the most consistent answer through majority voting.
 *
 * Created by: Olu Akinnawo
 * Publisher: Beunec Technologies, Inc.
 * Framework: CoT Self-Consistency (CoT-SC)
 */

interface CoTSCConfig {
    consistency: {
        pathCount: number;
        consensusThreshold: number;
        diversityBonus: boolean;
        outlierDetection: boolean;
    };
    voting: {
        method: 'majority' | 'weighted' | 'confidence-based' | 'hybrid';
        confidenceWeighting: boolean;
        qualityWeighting: boolean;
        diversityPenalty: boolean;
    };
    quality: {
        pathValidation: boolean;
        crossValidation: boolean;
        consistencyScoring: boolean;
        reliabilityMetrics: boolean;
    };
    governance: {
        enabled: boolean;
        pathGovernance: boolean;
        consensusGovernance: boolean;
        finalAnswerGovernance: boolean;
    };
    performance: {
        parallelExecution: boolean;
        caching: boolean;
        earlyConsensus: boolean;
        timeoutPerPath: number;
    };
}
interface ReasoningPath {
    id: string;
    cotResult: CoTResult;
    answer: string;
    confidence: number;
    quality: number;
    consistency: number;
    timestamp: number;
}
interface ConsensusResult {
    consensusAnswer: string;
    agreementLevel: number;
    participatingPaths: number;
    outlierPaths: number;
    confidenceScore: number;
    consistencyScore: number;
}
interface CoTSCResult {
    success: boolean;
    finalAnswer: string;
    consensus: ConsensusResult;
    reasoningPaths: ReasoningPath[];
    executionTime: number;
    overallConfidence: number;
    governanceResult?: GovernedAIResponse | undefined;
    metadata: {
        provider: string;
        model: string;
        pathCount: number;
        consensusMethod: string;
        qualityScore: number;
    };
}
declare class BrolostackCoTSC extends EventEmitter {
    private config;
    private logger;
    private cotFramework;
    private executionHistory;
    constructor(config?: Partial<CoTSCConfig>);
    /**
     * 🧠 MAIN COT-SC EXECUTION
     * Generates multiple reasoning paths and finds consensus
     */
    execute(query: string, context: {
        provider: string;
        model: string;
        apiKey: string;
        domain?: string;
        complexity?: 'simple' | 'medium' | 'complex' | 'expert';
    }): Promise<CoTSCResult>;
    /**
     * 🧠 GENERATE MULTIPLE REASONING PATHS
     */
    private generateReasoningPaths;
    /**
     * 🧠 FIND CONSENSUS
     */
    private findConsensus;
    /**
     * 🧠 GET CONSISTENCY STATISTICS
     */
    getConsistencyStatistics(): {
        totalExecutions: number;
        averageAgreementLevel: number;
        averagePathCount: number;
        averageConsistency: number;
        successRate: number;
    };
    private createDefaultConfig;
    private assessPathQuality;
    private groupSimilarAnswers;
    private applyVotingMechanism;
    private calculateAgreementLevel;
    private identifyOutliers;
    private calculateConsensusConfidence;
    private calculateConsistencyScore;
    private calculateOverallConfidence;
    private calculateAverageQuality;
    private calculateSimilarity;
}

interface BrolostackAIConfig {
    provider: {
        name: string;
        apiKey: string;
        model: string;
        baseURL?: string;
        temperature?: number;
        maxTokens?: number;
    };
    reasoning: {
        framework: 'react' | 'cot' | 'tot' | 'cotsc' | 'hybrid';
        reactConfig?: Partial<ReActConfig>;
        cotConfig?: Partial<CoTConfig>;
        totConfig?: Partial<ToTConfig>;
        cotscConfig?: Partial<CoTSCConfig>;
    };
    governance: {
        enabled: boolean;
        config?: Partial<BSDGFConfig>;
        realTimeMonitoring: boolean;
        safetyFirst: boolean;
    };
    memory: {
        enabled: boolean;
        contextWindow: number;
        semanticSearch: boolean;
        vectorSearch: boolean;
        persistentMemory: boolean;
    };
    websocket: {
        enabled: boolean;
        realTimeUpdates: boolean;
        multiAgentSupport: boolean;
        streamingResponses: boolean;
    };
    backend: {
        enabled: boolean;
        framework: 'express' | 'nestjs' | 'fastify' | 'fastapi' | 'django' | 'flask' | 'none';
        endpoints: string[];
        authentication: boolean;
    };
    tools: {
        enabled: boolean;
        allowedTools: string[];
        externalAPIs: Record<string, string>;
        customTools: Record<string, Function>;
    };
    performance: {
        caching: boolean;
        parallelProcessing: boolean;
        responseStreaming: boolean;
        optimizedPrompts: boolean;
    };
}
interface AIExecutionResult {
    success: boolean;
    response: string;
    reasoning?: ReActResult | CoTResult | ToTResult | CoTSCResult;
    governance?: any;
    metadata: {
        framework: string;
        provider: string;
        model: string;
        executionTime: number;
        confidence: number;
        safetyScore: number;
    };
}
declare class BrolostackAIFramework extends EventEmitter {
    private config;
    private logger;
    private reactFramework;
    private cotFramework;
    private totFramework;
    private cotscFramework;
    private governance;
    private websocketManager?;
    private memoryStore;
    private conversationHistory;
    constructor(config: BrolostackAIConfig);
    /**
     * 🤖 MAIN AI EXECUTION METHOD
     * Routes to appropriate reasoning framework
     */
    execute(query: string, options?: {
        conversationId?: string;
        userId?: string;
        context?: Record<string, any>;
        tools?: string[];
        streaming?: boolean;
    }): Promise<AIExecutionResult>;
    /**
     * 🤖 HYBRID REASONING
     * Combines multiple frameworks for optimal results
     */
    private executeHybridReasoning;
    /**
     * 🤖 MEMORY MANAGEMENT
     */
    private storeInMemory;
    private getConversationHistory;
    /**
     * 🤖 SEMANTIC SEARCH
     */
    semanticSearch(_query: string, documents: string[], options?: {
        topK?: number;
        threshold?: number;
    }): Promise<{
        document: string;
        score: number;
    }[]>;
    /**
     * 🤖 VECTOR SEARCH
     */
    vectorSearch(_query: string, vectors: number[][], options?: {
        topK?: number;
        threshold?: number;
    }): Promise<{
        vector: number[];
        score: number;
        index: number;
    }[]>;
    /**
     * 🤖 STREAM RESPONSE
     */
    streamResponse(query: string, onChunk: (chunk: string) => void, options?: any): Promise<AIExecutionResult>;
    /**
     * 🤖 GET FRAMEWORK STATUS
     */
    getStatus(): {
        framework: string;
        version: string;
        provider: string;
        model: string;
        reasoningFramework: "hybrid" | "react" | "cot" | "tot" | "cotsc";
        governanceEnabled: boolean;
        memoryEnabled: boolean;
        websocketEnabled: boolean;
        backendIntegration: "none" | "express" | "nestjs" | "fastify" | "fastapi" | "django" | "flask";
        environment: BrolostackEnvironment;
        conversationCount: number;
        memorySize: number;
    };
    /**
     * 🤖 GET EXECUTION STATISTICS
     */
    getExecutionStatistics(): {
        react: {};
        cot: {};
        tot: {};
        cotsc: {};
        governance: any;
        memory: {
            conversationCount: number;
            totalMessages: number;
        };
    };
    /**
     * 🤖 CLEAR MEMORY
     */
    clearMemory(conversationId?: string): void;
}
/**
 * 🤖 GET OR CREATE AI FRAMEWORK INSTANCE
 */
declare function getBrolostackAI(config: BrolostackAIConfig): BrolostackAIFramework;
/**
 * 🤖 AI FRAMEWORK UTILITIES
 */
declare const BrolostackAI: {
    /**
     * Quick AI execution with default settings
     */
    ask: (query: string, provider: string, apiKey: string, model?: string) => Promise<AIExecutionResult>;
    /**
     * ReAct reasoning execution
     */
    react: (query: string, provider: string, apiKey: string, model?: string) => Promise<AIExecutionResult>;
    /**
     * Chain-of-Thought execution
     */
    cot: (query: string, provider: string, apiKey: string, model?: string) => Promise<AIExecutionResult>;
    /**
     * Tree-of-Thoughts execution
     */
    tot: (query: string, provider: string, apiKey: string, model?: string) => Promise<AIExecutionResult>;
    /**
     * CoT Self-Consistency execution
     */
    cotsc: (query: string, provider: string, apiKey: string, model?: string) => Promise<AIExecutionResult>;
    /**
     * Get framework status
     */
    status: () => {
        framework: string;
        version: string;
        provider: string;
        model: string;
        reasoningFramework: "hybrid" | "react" | "cot" | "tot" | "cotsc";
        governanceEnabled: boolean;
        memoryEnabled: boolean;
        websocketEnabled: boolean;
        backendIntegration: "none" | "express" | "nestjs" | "fastify" | "fastapi" | "django" | "flask";
        environment: BrolostackEnvironment;
        conversationCount: number;
        memorySize: number;
    } | {
        status: string;
    };
};

interface BrolostackAIContextType {
    ai: BrolostackAIFramework;
    isInitialized: boolean;
    execute: (query: string, options?: any) => Promise<AIExecutionResult>;
    streamResponse: (query: string, onChunk: (chunk: string) => void, options?: any) => Promise<AIExecutionResult>;
    clearMemory: (conversationId?: string) => void;
    getStatus: () => any;
    getStatistics: () => any;
}
interface BrolostackAIProviderProps {
    children: ReactNode;
    config: BrolostackAIConfig;
    autoConnect?: boolean;
}
declare function BrolostackAIProvider({ children, config, autoConnect }: BrolostackAIProviderProps): react_jsx_runtime.JSX.Element;
/**
 * 🤖 Hook for using Brolostack AI
 */
declare function useBrolostackAI(): BrolostackAIContextType;
/**
 * 🤖 Hook for AI conversations
 */
declare function useAIConversation(conversationId: string): {
    messages: any[];
    sendMessage: (query: string, options?: any) => Promise<AIExecutionResult>;
    clearConversation: () => void;
    isLoading: boolean;
    messageCount: number;
};
/**
 * 🤖 Hook for streaming AI responses
 */
declare function useAIStreaming(): {
    streamingText: string;
    isStreaming: boolean;
    startStreaming: (query: string, options?: any) => Promise<AIExecutionResult>;
    clearStream: () => void;
};
/**
 * 🤖 Hook for AI governance monitoring
 */
declare function useAIGovernance(): {
    governanceStats: any;
    isGovernanceActive: boolean;
    safetyScore: any;
};
/**
 * 🤖 Hook for reasoning framework selection
 */
declare function useReasoningFramework(framework: 'react' | 'cot' | 'tot' | 'cotsc'): {
    framework: "react" | "cot" | "tot" | "cotsc";
    execute: (query: string, options?: any) => Promise<AIExecutionResult>;
};

interface UseTokenUsageOptions {
    userId: string;
    sessionId: string;
    controlLevel?: 'basic' | 'strict' | 'aggressive';
    maxInputTokens?: number;
    maxOutputTokens?: number;
    enableRealTimeMonitoring?: boolean;
    onLimitExceeded?: (result: TokenControlResult) => void;
    onStreamingCutoff?: (data: any) => void;
    onWarningThreshold?: (warning: string) => void;
}
/**
 * 💰 MAIN TOKEN USAGE HOOK
 * Frontend protocol for monitoring and controlling AI token usage
 */
declare function useTokenUsage(options: UseTokenUsageOptions): {
    metrics: TokenUsageMetrics | null;
    isLoading: boolean;
    warnings: string[];
    lastValidation: TokenControlResult | null;
    totalCost: number;
    remainingTokens: {
        input: number;
        output: number;
        total: number;
    };
    usagePercentage: {
        input: number;
        output: number;
        total: number;
    };
    validateTokenUsage: (inputText: string, provider: string, model: string, requestedMaxTokens?: number) => Promise<TokenControlResult>;
    trackStreamingTokens: (streamChunk: string, isComplete?: boolean) => TokenUsageMetrics;
    resetUserMetrics: () => void;
    clearWarnings: () => void;
    getCostEstimate: (inputTokens: number, outputTokens: number, provider: string, model: string) => number;
    shouldBlockRequest: (inputText: string) => boolean;
    isNearLimit: boolean;
    isAtLimit: boolean;
    canMakeRequest: boolean;
    controlLevel: "aggressive" | "basic" | "strict";
};
/**
 * 💰 TOKEN USAGE DISPLAY COMPONENT
 */
declare function TokenUsageDisplay({ userId, sessionId, showCost, showWarnings, compact }: {
    userId: string;
    sessionId: string;
    showCost?: boolean;
    showWarnings?: boolean;
    compact?: boolean;
}): react_jsx_runtime.JSX.Element;
/**
 * 💰 TOKEN USAGE GUARD COMPONENT
 * Automatically blocks requests when limits are exceeded
 */
declare function TokenUsageGuard({ userId, sessionId, children, onBlocked, fallback }: {
    userId: string;
    sessionId: string;
    children: React.ReactNode;
    onBlocked?: () => void;
    fallback?: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

interface BrolostackCIAMContextType {
    authManager: AuthManager;
    session: AuthSession | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthSession>;
    logout: () => Promise<void>;
    socialLogin: (provider: string) => Promise<AuthSession>;
    passwordlessLogin: (identifier: string) => Promise<AuthSession>;
    biometricLogin: () => Promise<AuthSession>;
    enableMFA: () => Promise<void>;
    activeProviders: string[];
    switchProvider: (type: 'ciam' | 'cloud', name?: string) => Promise<void>;
    getProviderSession: (name: string) => any;
    refreshToken: () => Promise<void>;
    isTokenValid: () => boolean;
}
interface BrolostackCIAMProviderProps {
    children: ReactNode;
    config: AuthConfig;
    autoLogin?: boolean;
    persistSession?: boolean;
}
declare function BrolostackCIAMProvider({ children, config, autoLogin, persistSession }: BrolostackCIAMProviderProps): react_jsx_runtime.JSX.Element;
/**
 * 🔐 Hook for using Brolostack CIAM
 */
declare function useBrolostackCIAM(): BrolostackCIAMContextType;
/**
 * 🔐 Hook for authentication state
 */
declare function useAuth(): {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthSession>;
    logout: () => Promise<void>;
};
/**
 * 🔐 Hook for role-based access control
 */
declare function usePermissions(): {
    user: User | null;
    hasPermission: (resource: string, action: string, context?: any) => boolean;
    hasRole: (roleName: string) => boolean;
    hasAnyRole: (roleNames: string[]) => boolean;
    hasAllRoles: (roleNames: string[]) => boolean;
    getHighestRole: () => Role | null;
    userRoles: Role[];
    userPermissions: Permission[];
};
/**
 * 🔐 Hook for social authentication
 */
declare function useSocialAuth(): {
    availableProviders: string[];
    loginWithProvider: (provider: string) => Promise<AuthSession>;
    isLoading: boolean;
};
/**
 * 🔐 Hook for passwordless authentication
 */
declare function usePasswordlessAuth(): {
    sendMagicLink: (email: string) => Promise<AuthSession>;
    sendSMSCode: (phoneNumber: string) => Promise<AuthSession>;
    isLoading: boolean;
};
/**
 * 🔐 Hook for biometric authentication
 */
declare function useBiometricAuth(): {
    isSupported: boolean;
    loginWithBiometric: () => Promise<AuthSession>;
    isLoading: boolean;
};
/**
 * 🔐 Hook for multi-factor authentication
 */
declare function useMFA(): {
    isMFAEnabled: boolean;
    setupMFA: () => Promise<void>;
    isLoading: boolean;
};
/**
 * 🔐 Hook for provider management
 */
declare function useProviderManagement(): {
    activeProviders: string[];
    providerSessions: Record<string, any>;
    switchToProvider: (type: "ciam" | "cloud", name?: string) => Promise<void>;
    isHybridMode: boolean;
    isTribridMode: boolean;
    primaryProvider: string | undefined;
    syncStatus: "pending" | "synced" | "failed" | undefined;
};
/**
 * 🔐 Protected Route Component
 */
declare function ProtectedRoute({ children, fallback, requireRoles, requirePermissions, requireMFA }: {
    children: ReactNode;
    fallback?: ReactNode;
    requireRoles?: string[];
    requirePermissions?: Array<{
        resource: string;
        action: string;
    }>;
    requireMFA?: boolean;
}): string | number | true | Iterable<ReactNode> | react_jsx_runtime.JSX.Element;

/**
 * FastAPI Backend Adapter for Brolostack
 * Provides seamless integration with FastAPI backends for full-stack and AI applications
 */

interface FastAPIConfig {
    baseURL: string;
    apiVersion?: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    authentication?: {
        type: 'bearer' | 'basic' | 'api-key';
        token?: string;
        apiKey?: string;
        username?: string;
        password?: string;
    };
    endpoints?: {
        health: string;
        auth: string;
        sync: string;
        websocket: string;
        ai: string;
    };
    middleware?: {
        cors: boolean;
        rateLimit: boolean;
        compression: boolean;
    };
}
interface AIModelConfig {
    provider: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' | 'huggingface' | 'stability-ai' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi' | 'local';
    model: string;
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
    systemPrompt?: string;
    endpoint?: string;
    region?: string;
}
declare class FastAPIAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private requestId;
    constructor(config: FastAPIConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    login(credentials: {
        username: string;
        password: string;
    }): Promise<any>;
    logout(): Promise<void>;
    syncStore(storeName: string, data: any): Promise<any>;
    restoreStore(storeName: string): Promise<any>;
    bulkSync(stores: Record<string, any>): Promise<any>;
    createAIChat(config: AIModelConfig): Promise<string>;
    sendAIMessage(chatId: string, message: string, streaming?: boolean): Promise<any>;
    streamAIMessage(chatId: string, message: string): Promise<ReadableStream>;
    getAIChatHistory(chatId: string, limit?: number): Promise<any>;
    createAgentTeam(teamConfig: {
        name: string;
        agents: Array<{
            name: string;
            role: string;
            model: string;
            tools?: string[];
            systemPrompt?: string;
        }>;
        workflow?: 'sequential' | 'parallel' | 'hierarchical';
    }): Promise<string>;
    executeAgentTask(teamId: string, task: {
        description: string;
        context?: any;
        maxIterations?: number;
        timeout?: number;
    }): Promise<any>;
    createWebSocketConnection(): WebSocket;
    uploadFile(file: File, metadata?: Record<string, any>): Promise<any>;
    downloadFile(fileId: string): Promise<Blob>;
    executeQuery(query: {
        table: string;
        operation: 'select' | 'insert' | 'update' | 'delete';
        data?: any;
        where?: Record<string, any>;
        orderBy?: string;
        limit?: number;
    }): Promise<any>;
    getAnalytics(timeRange?: string): Promise<any>;
    logEvent(event: {
        type: string;
        data: any;
        userId?: string;
        sessionId?: string;
    }): Promise<void>;
    private request;
    private makeRequest;
    private getHeaders;
    private getAuthHeaders;
    private delay;
    getConfig(): FastAPIConfig;
    updateConfig(updates: Partial<FastAPIConfig>): void;
    getStats(): {
        connected: boolean;
        baseURL: string;
        requestCount: number;
        lastActivity: string;
    };
}

/**
 * Flask Backend Adapter for Brolostack
 * Provides seamless integration with Flask backends for rapid prototyping and microservices
 */

interface FlaskConfig {
    baseURL: string;
    timeout?: number;
    retryAttempts?: number;
    authentication?: {
        type: 'session' | 'jwt' | 'basic';
        sessionKey?: string;
        jwtSecret?: string;
        username?: string;
        password?: string;
    };
    endpoints?: {
        health: string;
        auth: string;
        sync: string;
        api: string;
    };
    csrf?: {
        enabled: boolean;
        tokenName?: string;
        headerName?: string;
    };
}
interface FlaskSession {
    sessionId: string;
    csrfToken?: string;
    user?: any;
    expires?: Date;
}
declare class FlaskAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private session;
    private requestId;
    constructor(config: FlaskConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    private initializeSession;
    login(credentials: {
        username: string;
        password: string;
    }): Promise<any>;
    logout(): Promise<void>;
    syncStore(storeName: string, data: any): Promise<any>;
    restoreStore(storeName: string): Promise<any>;
    renderTemplate(templateName: string, context?: Record<string, any>): Promise<string>;
    callFlaskFunction(functionName: string, args?: any[], kwargs?: Record<string, any>): Promise<any>;
    submitForm(formData: FormData, endpoint: string): Promise<any>;
    uploadFile(file: File, endpoint?: string, metadata?: Record<string, any>): Promise<any>;
    queryDatabase(query: {
        model: string;
        operation: 'get' | 'filter' | 'create' | 'update' | 'delete';
        data?: any;
        filters?: Record<string, any>;
        limit?: number;
        offset?: number;
    }): Promise<any>;
    sendEmail(emailData: {
        to: string | string[];
        subject: string;
        body: string;
        html?: string;
        attachments?: Array<{
            filename: string;
            data: string;
        }>;
    }): Promise<any>;
    getCachedData(key: string): Promise<any>;
    setCachedData(key: string, value: any, timeout?: number): Promise<void>;
    createSocketIOConnection(): any;
    private request;
    private getHeaders;
    getSession(): FlaskSession | null;
    getConfig(): FlaskConfig;
    updateConfig(updates: Partial<FlaskConfig>): void;
    getStats(): {
        connected: boolean;
        baseURL: string;
        requestCount: number;
        sessionActive: boolean;
        csrfEnabled: boolean;
    };
}

/**
 * AutoGen Multi-Agent Framework Adapter for Brolostack
 * Provides seamless integration with Microsoft AutoGen for multi-agent AI applications
 */

interface AutoGenConfig {
    backendURL: string;
    defaultLLMProvider?: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' | 'huggingface' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi' | 'local';
    llmConfigs?: Record<string, {
        apiKey?: string;
        endpoint?: string;
        region?: string;
        model: string;
        temperature?: number;
        maxTokens?: number;
    }>;
    codeExecutionConfig?: {
        enabled: boolean;
        workingDirectory: string;
        timeout: number;
        allowedLanguages: string[];
        dockerEnabled?: boolean;
        securitySandbox?: boolean;
    };
    multiProviderFallback?: {
        enabled: boolean;
        fallbackOrder: string[];
        maxRetries: number;
    };
}
interface AutoGenAgent {
    name: string;
    systemMessage: string;
    llmConfig: {
        model: string;
        temperature: number;
        maxTokens: number;
        functions?: AutoGenFunction[];
    };
    humanInputMode: 'NEVER' | 'TERMINATE' | 'ALWAYS';
    maxConsecutiveAutoReply: number;
    codeExecutionConfig?: {
        workingDirectory: string;
        useDocker: boolean;
        timeout: number;
    };
}
interface AutoGenFunction {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required: string[];
    };
    implementation?: string;
}
interface AutoGenConversation {
    id: string;
    agents: AutoGenAgent[];
    messages: AutoGenMessage[];
    status: 'active' | 'completed' | 'error' | 'terminated';
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}
interface AutoGenMessage {
    id: string;
    sender: string;
    recipient: string;
    content: string;
    messageType: 'text' | 'code' | 'function_call' | 'function_result' | 'system';
    timestamp: Date;
    metadata?: {
        executionResult?: {
            exitCode: number;
            output: string;
            error?: string;
        };
        functionCall?: {
            name: string;
            arguments: Record<string, any>;
            result?: any;
        };
    };
}
interface AutoGenGroupChat {
    id: string;
    name: string;
    agents: AutoGenAgent[];
    adminName?: string;
    maxRound: number;
    speakerSelectionMethod: 'auto' | 'manual' | 'random' | 'round_robin';
    allowRepeatSpeaker: boolean;
    conversations: AutoGenConversation[];
}
declare class AutoGenAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private conversations;
    private groupChats;
    constructor(config: AutoGenConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    createAgent(agentConfig: Omit<AutoGenAgent, 'name'> & {
        name: string;
    }): Promise<AutoGenAgent>;
    updateAgent(agentName: string, updates: Partial<AutoGenAgent>): Promise<AutoGenAgent>;
    deleteAgent(agentName: string): Promise<void>;
    listAgents(): Promise<AutoGenAgent[]>;
    createConversation(initiatorAgent: string, recipientAgent: string, message: string, metadata?: Record<string, any>): Promise<AutoGenConversation>;
    sendMessage(conversationId: string, sender: string, recipient: string, content: string, messageType?: AutoGenMessage['messageType']): Promise<AutoGenMessage>;
    getConversation(conversationId: string): Promise<AutoGenConversation | null>;
    terminateConversation(conversationId: string, reason?: string): Promise<void>;
    createGroupChat(config: {
        name: string;
        agents: string[];
        adminName?: string;
        maxRound?: number;
        speakerSelectionMethod?: AutoGenGroupChat['speakerSelectionMethod'];
        allowRepeatSpeaker?: boolean;
    }): Promise<AutoGenGroupChat>;
    startGroupChat(groupChatId: string, initialMessage: string, sender?: string): Promise<AutoGenConversation>;
    executeCode(code: string, language: 'python' | 'javascript' | 'bash' | 'sql', workingDirectory?: string): Promise<{
        exitCode: number;
        output: string;
        error?: string;
        executionTime: number;
    }>;
    registerFunction(func: AutoGenFunction): Promise<void>;
    callFunction(functionName: string, arguments_: Record<string, any>, context?: Record<string, any>): Promise<any>;
    createWorkflow(workflow: {
        name: string;
        description: string;
        agents: string[];
        steps: Array<{
            name: string;
            agent: string;
            action: string;
            parameters?: Record<string, any>;
            conditions?: Record<string, any>;
        }>;
        triggers?: Array<{
            type: 'schedule' | 'webhook' | 'event';
            config: Record<string, any>;
        }>;
    }): Promise<string>;
    executeWorkflow(workflowId: string, inputs?: Record<string, any>): Promise<{
        executionId: string;
        status: 'running' | 'completed' | 'failed';
        results?: Record<string, any>;
    }>;
    createWebSocketConnection(): WebSocket;
    private handleConversationUpdate;
    private handleMessageReceived;
    private handleAgentStatus;
    private handleCodeExecutionResult;
    getConversations(): AutoGenConversation[];
    getGroupChats(): AutoGenGroupChat[];
    getConfig(): AutoGenConfig;
    updateConfig(updates: Partial<AutoGenConfig>): void;
    getStats(): {
        connected: boolean;
        conversationCount: number;
        groupChatCount: number;
        backendURL: string;
    };
}

/**
 * CrewAI Framework Adapter for Brolostack
 * Provides seamless integration with CrewAI for role-based multi-agent AI applications
 */

interface CrewAIConfig {
    backendURL: string;
    defaultLLM?: {
        provider: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' | 'huggingface' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi' | 'local';
        model: string;
        apiKey?: string;
        endpoint?: string;
        region?: string;
    };
    memory?: {
        enabled: boolean;
        provider: 'local' | 'redis' | 'chromadb';
        config?: Record<string, any>;
    };
    tools?: {
        enabled: string[];
        custom?: CrewAITool[];
    };
}
interface CrewAIAgent {
    role: string;
    goal: string;
    backstory: string;
    tools?: string[];
    llm?: {
        provider: string;
        model: string;
        temperature?: number;
        maxTokens?: number;
    };
    memory?: boolean;
    verbose?: boolean;
    allowDelegation?: boolean;
    maxIter?: number;
    maxExecutionTime?: number;
}
interface CrewAITask {
    description: string;
    expectedOutput: string;
    agent?: string;
    tools?: string[];
    async?: boolean;
    context?: string[];
    outputFile?: string;
    outputJson?: any;
    callback?: string;
}
interface CrewAICrew {
    id: string;
    name: string;
    agents: CrewAIAgent[];
    tasks: CrewAITask[];
    process: 'sequential' | 'hierarchical';
    verbose?: boolean;
    memory?: boolean;
    cache?: boolean;
    maxRpm?: number;
    language?: string;
    fullOutput?: boolean;
    stepCallback?: string;
    taskCallback?: string;
}
interface CrewAITool {
    name: string;
    description: string;
    parameters?: Record<string, any>;
    implementation: string;
    requirements?: string[];
}
interface CrewAIExecution {
    id: string;
    crewId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    results?: {
        tasks: Array<{
            task: string;
            output: string;
            agent: string;
            executionTime: number;
        }>;
        finalOutput: string;
        totalExecutionTime: number;
    };
    error?: string;
    logs?: string[];
}
declare class CrewAIAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private crews;
    private executions;
    private tools;
    constructor(config: CrewAIConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    createAgent(agentConfig: CrewAIAgent): Promise<string>;
    updateAgent(agentId: string, updates: Partial<CrewAIAgent>): Promise<void>;
    createTask(taskConfig: CrewAITask): Promise<string>;
    createCrew(crewConfig: Omit<CrewAICrew, 'id'>): Promise<CrewAICrew>;
    kickoffCrew(crewId: string, inputs?: Record<string, any>): Promise<CrewAIExecution>;
    getCrewExecution(executionId: string): Promise<CrewAIExecution | null>;
    cancelCrewExecution(executionId: string): Promise<void>;
    registerTool(tool: CrewAITool): Promise<void>;
    getAvailableTools(): Promise<CrewAITool[]>;
    storeMemory(key: string, value: any, metadata?: Record<string, any>): Promise<void>;
    retrieveMemory(key: string): Promise<any>;
    searchMemory(query: string, limit?: number): Promise<any[]>;
    trainCrew(crewId: string, trainingData: {
        scenarios: Array<{
            inputs: Record<string, any>;
            expectedOutputs: Record<string, any>;
            feedback?: string;
        }>;
        iterations?: number;
        validationSplit?: number;
    }): Promise<{
        trainingId: string;
        status: 'started' | 'completed' | 'failed';
    }>;
    getTrainingStatus(trainingId: string): Promise<{
        status: 'running' | 'completed' | 'failed';
        progress?: number;
        metrics?: Record<string, any>;
        logs?: string[];
    }>;
    getCrewAnalytics(crewId: string, timeRange?: string): Promise<{
        executionCount: number;
        averageExecutionTime: number;
        successRate: number;
        taskBreakdown: Record<string, any>;
        agentPerformance: Record<string, any>;
    }>;
    createWebSocketConnection(): WebSocket;
    private handleExecutionUpdate;
    private handleTaskCompleted;
    private handleAgentThinking;
    private handleToolUsed;
    private initializeDefaultTools;
    getCrews(): CrewAICrew[];
    getExecutions(): CrewAIExecution[];
    getTools(): CrewAITool[];
    getConfig(): CrewAIConfig;
    updateConfig(updates: Partial<CrewAIConfig>): void;
    getStats(): {
        connected: boolean;
        crewCount: number;
        executionCount: number;
        toolCount: number;
        memoryEnabled: boolean;
    };
}

/**
 * LangChain Framework Adapter for Brolostack
 * Provides seamless integration with LangChain for advanced AI applications
 */

interface LangChainConfig {
    backendURL: string;
    llmConfig?: {
        provider: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' | 'huggingface' | 'stability-ai' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi' | 'local';
        model: string;
        apiKey?: string;
        endpoint?: string;
        region?: string;
        temperature?: number;
        maxTokens?: number;
    };
    memory?: {
        type: 'buffer' | 'summary' | 'vector' | 'entity';
        config?: Record<string, any>;
    };
    vectorStore?: {
        provider: 'chroma' | 'pinecone' | 'weaviate' | 'faiss';
        config: Record<string, any>;
    };
    embeddings?: {
        provider: 'openai' | 'huggingface' | 'local';
        model: string;
        apiKey?: string;
    };
}
interface LangChainChain {
    id: string;
    name: string;
    type: 'llm' | 'conversation' | 'sequential' | 'router' | 'map_reduce' | 'stuff' | 'refine';
    config: Record<string, any>;
    inputVariables: string[];
    outputVariables: string[];
    memory?: string;
    tools?: string[];
}
interface LangChainPrompt {
    id: string;
    name: string;
    template: string;
    inputVariables: string[];
    partialVariables?: Record<string, string>;
    templateFormat?: 'f-string' | 'jinja2';
    validateTemplate?: boolean;
}
interface LangChainTool {
    name: string;
    description: string;
    parameters?: Record<string, any>;
    returnDirect?: boolean;
    verbose?: boolean;
    implementation: string;
}
interface LangChainAgent {
    id: string;
    name: string;
    type: 'zero-shot-react' | 'react-docstore' | 'self-ask-with-search' | 'conversational-react' | 'chat-zero-shot-react';
    llm: string;
    tools: string[];
    memory?: string;
    verbose?: boolean;
    maxIterations?: number;
    maxExecutionTime?: number;
}
interface LangChainExecution {
    id: string;
    chainId?: string;
    agentId?: string;
    inputs: Record<string, any>;
    outputs?: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    executionTime?: number;
    intermediateSteps?: Array<{
        action: string;
        observation: string;
        timestamp: Date;
    }>;
    error?: string;
}
declare class LangChainAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private chains;
    private prompts;
    private tools;
    private agents;
    private executions;
    constructor(config: LangChainConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    createChain(chainConfig: Omit<LangChainChain, 'id'>): Promise<LangChainChain>;
    runChain(chainId: string, inputs: Record<string, any>, streaming?: boolean): Promise<LangChainExecution>;
    private runChainStreaming;
    createPrompt(promptConfig: Omit<LangChainPrompt, 'id'>): Promise<LangChainPrompt>;
    formatPrompt(promptId: string, variables: Record<string, any>): Promise<string>;
    addDocuments(documents: Array<{
        content: string;
        metadata?: Record<string, any>;
    }>): Promise<string[]>;
    similaritySearch(query: string, k?: number, filter?: Record<string, any>): Promise<Array<{
        content: string;
        metadata: Record<string, any>;
        score: number;
    }>>;
    createAgent(agentConfig: Omit<LangChainAgent, 'id'>): Promise<LangChainAgent>;
    runAgent(agentId: string, input: string, chatHistory?: Array<{
        role: 'human' | 'ai';
        content: string;
    }>): Promise<LangChainExecution>;
    saveMemory(key: string, value: any): Promise<void>;
    loadMemory(key: string): Promise<any>;
    clearMemory(key?: string): Promise<void>;
    processDocument(document: File | string, processingOptions?: {
        chunkSize?: number;
        chunkOverlap?: number;
        separators?: string[];
        addToVectorStore?: boolean;
        extractMetadata?: boolean;
    }): Promise<{
        chunks: Array<{
            content: string;
            metadata: Record<string, any>;
        }>;
        documentId: string;
    }>;
    askQuestion(question: string, context?: {
        documents?: string[];
        vectorStore?: boolean;
        chatHistory?: Array<{
            role: 'human' | 'ai';
            content: string;
        }>;
    }): Promise<{
        answer: string;
        sources?: Array<{
            content: string;
            metadata: Record<string, any>;
            score: number;
        }>;
        reasoning?: string;
    }>;
    analyzeCode(code: string, language: string, analysisType: 'security' | 'performance' | 'style' | 'documentation' | 'testing'): Promise<{
        analysis: string;
        suggestions: string[];
        score: number;
        issues?: Array<{
            type: 'error' | 'warning' | 'info';
            message: string;
            line?: number;
            column?: number;
        }>;
    }>;
    generateCode(prompt: string, language: string, context?: {
        existingCode?: string;
        requirements?: string[];
        style?: string;
    }): Promise<{
        code: string;
        explanation: string;
        tests?: string;
        documentation?: string;
    }>;
    createRAGChain(config: {
        name: string;
        vectorStore: string;
        retrievalConfig: {
            k: number;
            searchType: 'similarity' | 'mmr' | 'similarity_score_threshold';
            searchKwargs?: Record<string, any>;
        };
        llmConfig?: Record<string, any>;
    }): Promise<string>;
    queryRAG(ragChainId: string, query: string, chatHistory?: Array<{
        role: 'human' | 'ai';
        content: string;
    }>): Promise<{
        answer: string;
        sourceDocuments: Array<{
            content: string;
            metadata: Record<string, any>;
            score: number;
        }>;
    }>;
    registerTool(tool: LangChainTool): Promise<void>;
    private initializeVectorStore;
    private initializeDefaultTools;
    getChains(): LangChainChain[];
    getPrompts(): LangChainPrompt[];
    getTools(): LangChainTool[];
    getAgents(): LangChainAgent[];
    getExecutions(): LangChainExecution[];
    getConfig(): LangChainConfig;
    updateConfig(updates: Partial<LangChainConfig>): void;
    getStats(): {
        connected: boolean;
        chainCount: number;
        promptCount: number;
        toolCount: number;
        agentCount: number;
        executionCount: number;
        vectorStoreEnabled: boolean;
        memoryEnabled: boolean;
    };
}

/**
 * LangGraph Framework Adapter for Brolostack
 * Provides seamless integration with LangGraph for complex AI workflow applications
 */

interface LangGraphConfig {
    backendURL: string;
    llmConfig?: {
        provider: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' | 'huggingface' | 'stability-ai' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi' | 'local';
        model: string;
        apiKey?: string;
        endpoint?: string;
        region?: string;
    };
    checkpointer?: {
        type: 'memory' | 'sqlite' | 'postgres' | 'redis';
        config?: Record<string, any>;
    };
    interrupts?: {
        enabled: boolean;
        beforeNodes?: string[];
        afterNodes?: string[];
    };
}
interface LangGraphNode {
    id: string;
    name: string;
    type: 'llm' | 'tool' | 'human' | 'conditional' | 'parallel' | 'custom';
    config: Record<string, any>;
    inputs: string[];
    outputs: string[];
    conditions?: Record<string, any>;
    retryConfig?: {
        maxRetries: number;
        retryDelay: number;
        retryConditions: string[];
    };
}
interface LangGraphEdge {
    from: string;
    to: string;
    condition?: string;
    weight?: number;
    metadata?: Record<string, any>;
}
interface LangGraphWorkflow {
    id: string;
    name: string;
    description: string;
    nodes: LangGraphNode[];
    edges: LangGraphEdge[];
    entryPoint: string;
    exitPoints: string[];
    state: Record<string, any>;
    config?: {
        maxSteps?: number;
        timeout?: number;
        parallelism?: number;
        checkpointFrequency?: number;
    };
}
interface LangGraphExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'interrupted' | 'cancelled';
    currentNode?: string;
    state: Record<string, any>;
    startTime: Date;
    endTime?: Date;
    steps: Array<{
        nodeId: string;
        nodeName: string;
        startTime: Date;
        endTime?: Date;
        inputs: Record<string, any>;
        outputs?: Record<string, any>;
        error?: string;
        retryCount?: number;
    }>;
    checkpoints: Array<{
        id: string;
        nodeId: string;
        state: Record<string, any>;
        timestamp: Date;
    }>;
    interrupts: Array<{
        id: string;
        nodeId: string;
        reason: string;
        timestamp: Date;
        resolved?: boolean;
        resolution?: Record<string, any>;
    }>;
}
interface LangGraphState {
    [key: string]: any;
    _metadata?: {
        executionId: string;
        currentNode: string;
        stepCount: number;
        lastUpdate: Date;
    };
}
declare class LangGraphAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private workflows;
    private executions;
    private activeExecutions;
    constructor(config: LangGraphConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    createWorkflow(workflowConfig: Omit<LangGraphWorkflow, 'id'>): Promise<LangGraphWorkflow>;
    updateWorkflow(workflowId: string, updates: Partial<LangGraphWorkflow>): Promise<LangGraphWorkflow>;
    validateWorkflow(workflowId: string): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
        suggestions: string[];
    }>;
    executeWorkflow(workflowId: string, initialState: LangGraphState, config?: {
        maxSteps?: number;
        timeout?: number;
        checkpointFrequency?: number;
        interruptBefore?: string[];
        interruptAfter?: string[];
    }): Promise<LangGraphExecution>;
    streamWorkflowExecution(workflowId: string, initialState: LangGraphState, onUpdate: (execution: LangGraphExecution) => void): Promise<ReadableStream>;
    pauseExecution(executionId: string): Promise<void>;
    resumeExecution(executionId: string, state?: Partial<LangGraphState>): Promise<void>;
    cancelExecution(executionId: string): Promise<void>;
    createCheckpoint(executionId: string, nodeId: string): Promise<string>;
    restoreFromCheckpoint(executionId: string, checkpointId: string): Promise<void>;
    resolveInterrupt(executionId: string, interruptId: string, resolution: Record<string, any>): Promise<void>;
    analyzeWorkflow(workflowId: string): Promise<{
        complexity: number;
        cycleDetection: {
            hasCycles: boolean;
            cycles?: string[][];
        };
        criticalPath: string[];
        bottlenecks: string[];
        parallelizationOpportunities: string[][];
        estimatedExecutionTime: number;
    }>;
    optimizeWorkflow(workflowId: string, optimizationGoals: {
        minimizeExecutionTime?: boolean;
        maximizeParallelism?: boolean;
        minimizeResourceUsage?: boolean;
        improveReliability?: boolean;
    }): Promise<{
        optimizedWorkflow: LangGraphWorkflow;
        improvements: Array<{
            type: string;
            description: string;
            impact: string;
        }>;
    }>;
    createWebSocketConnection(): WebSocket;
    updateExecutionState(executionId: string, stateUpdates: Partial<LangGraphState>): Promise<LangGraphState>;
    getExecutionState(executionId: string): Promise<LangGraphState>;
    createCustomNode(nodeConfig: {
        name: string;
        implementation: string;
        inputs: string[];
        outputs: string[];
        description?: string;
        requirements?: string[];
    }): Promise<string>;
    createWorkflowTemplate(template: {
        name: string;
        description: string;
        category: 'data-processing' | 'ai-pipeline' | 'automation' | 'analysis' | 'custom';
        workflow: Omit<LangGraphWorkflow, 'id'>;
        parameters: Array<{
            name: string;
            type: string;
            description: string;
            default?: any;
            required: boolean;
        }>;
    }): Promise<string>;
    instantiateTemplate(templateId: string, parameters: Record<string, any>): Promise<LangGraphWorkflow>;
    private handleExecutionUpdate;
    private handleNodeStarted;
    private handleNodeCompleted;
    private handleInterruptTriggered;
    private handleCheckpointCreated;
    private handleStateUpdated;
    getWorkflows(): LangGraphWorkflow[];
    getExecutions(): LangGraphExecution[];
    getActiveExecutions(): LangGraphExecution[];
    getConfig(): LangGraphConfig;
    updateConfig(updates: Partial<LangGraphConfig>): void;
    getStats(): {
        connected: boolean;
        workflowCount: number;
        executionCount: number;
        activeExecutionCount: number;
        checkpointerEnabled: boolean;
        interruptsEnabled: boolean;
    };
}

/**
 * Express.js Backend Adapter for Brolostack
 * Provides seamless integration with Express.js backends for full-stack applications
 */

interface ExpressConfig {
    baseURL: string;
    timeout?: number;
    retryAttempts?: number;
    authentication?: {
        type: 'jwt' | 'session' | 'passport' | 'custom';
        jwtSecret?: string;
        sessionSecret?: string;
        cookieName?: string;
        tokenHeader?: string;
    };
    middleware?: {
        cors: boolean;
        helmet: boolean;
        compression: boolean;
        rateLimit: boolean;
        morgan: boolean;
    };
    endpoints?: {
        health: string;
        auth: string;
        api: string;
        upload: string;
        websocket: string;
    };
    socketIO?: {
        enabled: boolean;
        path?: string;
        transports?: string[];
        cors?: Record<string, any>;
    };
}
interface ExpressRoute {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    handler: string;
    middleware?: string[];
    validation?: {
        body?: Record<string, any>;
        query?: Record<string, any>;
        params?: Record<string, any>;
    };
    rateLimit?: {
        windowMs: number;
        max: number;
    };
}
interface ExpressMiddleware {
    name: string;
    type: 'auth' | 'validation' | 'logging' | 'security' | 'custom';
    config: Record<string, any>;
    implementation?: string;
}
interface ExpressSession {
    sessionId: string;
    userId?: string;
    data: Record<string, any>;
    createdAt: Date;
    lastAccess: Date;
    expiresAt: Date;
}
declare class ExpressAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private session;
    private socketIO;
    private routes;
    private middleware;
    constructor(config: ExpressConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    login(credentials: {
        username: string;
        password: string;
        rememberMe?: boolean;
    }): Promise<any>;
    logout(): Promise<void>;
    get(endpoint: string, params?: Record<string, any>): Promise<any>;
    post(endpoint: string, data?: any): Promise<any>;
    put(endpoint: string, data?: any): Promise<any>;
    delete(endpoint: string): Promise<any>;
    patch(endpoint: string, data?: any): Promise<any>;
    uploadFile(file: File, endpoint?: string, metadata?: Record<string, any>): Promise<any>;
    downloadFile(fileId: string, filename?: string): Promise<Blob>;
    private initializeSocketIO;
    emitToServer(event: string, data: any): void;
    joinRoom(roomName: string): void;
    leaveRoom(roomName: string): void;
    broadcastToRoom(roomName: string, event: string, data: any): void;
    queryDatabase(query: {
        model: string;
        operation: 'find' | 'findOne' | 'create' | 'update' | 'delete' | 'aggregate';
        data?: any;
        filter?: Record<string, any>;
        options?: Record<string, any>;
    }): Promise<any>;
    mongooseOperation(operation: {
        model: string;
        method: 'find' | 'findById' | 'findOne' | 'create' | 'findByIdAndUpdate' | 'findByIdAndDelete' | 'aggregate';
        params?: any;
        options?: Record<string, any>;
    }): Promise<any>;
    sequelizeOperation(operation: {
        model: string;
        method: 'findAll' | 'findByPk' | 'findOne' | 'create' | 'update' | 'destroy' | 'bulkCreate';
        data?: any;
        where?: Record<string, any>;
        include?: any[];
        order?: any[];
        limit?: number;
        offset?: number;
    }): Promise<any>;
    prismaOperation(operation: {
        model: string;
        method: 'findMany' | 'findUnique' | 'findFirst' | 'create' | 'update' | 'delete' | 'upsert' | 'createMany';
        data?: any;
        where?: Record<string, any>;
        include?: Record<string, any>;
        select?: Record<string, any>;
        orderBy?: Record<string, any>;
        take?: number;
        skip?: number;
    }): Promise<any>;
    setCache(key: string, value: any, ttl?: number): Promise<void>;
    getCache(key: string): Promise<any>;
    deleteCache(key: string): Promise<void>;
    createJob(jobConfig: {
        queueName: string;
        jobName: string;
        data: any;
        options?: {
            delay?: number;
            priority?: number;
            attempts?: number;
            backoff?: {
                type: 'fixed' | 'exponential';
                delay: number;
            };
            removeOnComplete?: number;
            removeOnFail?: number;
        };
    }): Promise<string>;
    getJobStatus(jobId: string): Promise<{
        id: string;
        status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
        progress: number;
        data: any;
        result?: any;
        error?: string;
        createdAt: Date;
        processedAt?: Date;
        finishedAt?: Date;
    }>;
    sendEmail(emailConfig: {
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        attachments?: Array<{
            filename: string;
            content: string | Buffer;
            contentType?: string;
        }>;
        template?: {
            name: string;
            data: Record<string, any>;
        };
    }): Promise<any>;
    createPaymentIntent(paymentConfig: {
        amount: number;
        currency: string;
        customerId?: string;
        metadata?: Record<string, any>;
        paymentMethodTypes?: string[];
    }): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<any>;
    trackEvent(event: {
        name: string;
        properties: Record<string, any>;
        userId?: string;
        sessionId?: string;
        timestamp?: Date;
    }): Promise<void>;
    getAnalytics(query: {
        metric: string;
        timeRange: string;
        filters?: Record<string, any>;
        groupBy?: string[];
    }): Promise<any>;
    private request;
    private getHeaders;
    private getAuthHeaders;
    getSession(): ExpressSession | null;
    getRoutes(): ExpressRoute[];
    getMiddleware(): ExpressMiddleware[];
    getConfig(): ExpressConfig;
    updateConfig(updates: Partial<ExpressConfig>): void;
    getStats(): {
        connected: boolean;
        baseURL: string;
        sessionActive: boolean;
        socketIOConnected: any;
        routeCount: number;
        middlewareCount: number;
    };
}

/**
 * NestJS Backend Adapter for Brolostack
 * Provides seamless integration with NestJS backends for enterprise applications
 */

interface NestJSConfig {
    baseURL: string;
    timeout?: number;
    retryAttempts?: number;
    authentication?: {
        type: 'jwt' | 'passport' | 'custom';
        jwtSecret?: string;
        strategies?: string[];
        guards?: string[];
    };
    swagger?: {
        enabled: boolean;
        path?: string;
        version?: string;
    };
    microservices?: {
        enabled: boolean;
        transport: 'TCP' | 'REDIS' | 'MQTT' | 'NATS' | 'RMQ';
        config?: Record<string, any>;
    };
    graphql?: {
        enabled: boolean;
        playground?: boolean;
        introspection?: boolean;
        subscriptions?: boolean;
    };
    websocket?: {
        enabled: boolean;
        gateway?: string;
        namespace?: string;
    };
}
interface NestJSModule {
    name: string;
    type: 'feature' | 'shared' | 'core' | 'common';
    providers: string[];
    controllers: string[];
    imports?: string[];
    exports?: string[];
}
interface NestJSService {
    name: string;
    module: string;
    methods: Array<{
        name: string;
        parameters: Record<string, any>;
        returnType: string;
        description?: string;
    }>;
    dependencies?: string[];
}
interface NestJSController {
    name: string;
    path: string;
    module: string;
    routes: Array<{
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        path: string;
        handler: string;
        guards?: string[];
        interceptors?: string[];
        pipes?: string[];
        decorators?: string[];
    }>;
}
interface NestJSGuard {
    name: string;
    type: 'auth' | 'role' | 'permission' | 'throttle' | 'custom';
    config: Record<string, any>;
    implementation?: string;
}
interface NestJSInterceptor {
    name: string;
    type: 'logging' | 'transform' | 'cache' | 'timeout' | 'custom';
    config: Record<string, any>;
    implementation?: string;
}
interface NestJSPipe {
    name: string;
    type: 'validation' | 'transform' | 'parse' | 'custom';
    config: Record<string, any>;
    implementation?: string;
}
declare class NestJSAdapter extends EventEmitter {
    private config;
    private logger;
    private connected;
    private modules;
    private services;
    private controllers;
    private guards;
    private interceptors;
    private pipes;
    private websocketGateway;
    constructor(config: NestJSConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    login(credentials: {
        username: string;
        password: string;
        strategy?: string;
    }): Promise<any>;
    oauthLogin(provider: 'google' | 'github' | 'facebook' | 'twitter'): Promise<void>;
    logout(): Promise<void>;
    callService(serviceName: string, method: string, params?: any[]): Promise<any>;
    graphqlQuery(query: string, variables?: Record<string, any>): Promise<any>;
    graphqlSubscription(subscription: string, variables?: Record<string, any>, onData?: (data: any) => void): Promise<() => void>;
    sendMicroserviceMessage(service: string, pattern: string, data: any): Promise<any>;
    private initializeWebSocketGateway;
    validateData(data: any, validationSchema: string): Promise<{
        valid: boolean;
        errors?: Array<{
            property: string;
            constraints: Record<string, string>;
            value: any;
        }>;
    }>;
    transformData(data: any, transformationPipe: string): Promise<any>;
    setCache(key: string, value: any, ttl?: number): Promise<void>;
    getCache(key: string): Promise<any>;
    addToQueue(queueName: string, jobData: {
        name: string;
        data: any;
        options?: {
            delay?: number;
            priority?: number;
            attempts?: number;
            backoff?: string;
            removeOnComplete?: boolean;
            removeOnFail?: boolean;
        };
    }): Promise<string>;
    getQueueStatus(queueName: string): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        paused: boolean;
    }>;
    emitEvent(eventName: string, payload: any): Promise<void>;
    subscribeToEvent(eventName: string, callback: (payload: any) => void): Promise<() => void>;
    getConfiguration(configKey?: string): Promise<any>;
    updateConfiguration(configKey: string, value: any): Promise<void>;
    getHealthCheck(): Promise<{
        status: 'ok' | 'error' | 'shutting_down';
        info: Record<string, any>;
        error: Record<string, any>;
        details: Record<string, any>;
    }>;
    getMetrics(): Promise<{
        uptime: number;
        memory: Record<string, number>;
        cpu: Record<string, number>;
        requests: Record<string, number>;
        database: Record<string, any>;
        cache: Record<string, any>;
    }>;
    getOpenAPISpec(): Promise<any>;
    typeormQuery(query: {
        entity: string;
        operation: 'find' | 'findOne' | 'save' | 'update' | 'delete' | 'query';
        data?: any;
        where?: Record<string, any>;
        relations?: string[];
        order?: Record<string, 'ASC' | 'DESC'>;
        take?: number;
        skip?: number;
        sql?: string;
    }): Promise<any>;
    runTests(testConfig: {
        type: 'unit' | 'integration' | 'e2e';
        pattern?: string;
        coverage?: boolean;
        watch?: boolean;
    }): Promise<{
        results: {
            passed: number;
            failed: number;
            skipped: number;
            total: number;
        };
        coverage?: {
            lines: number;
            functions: number;
            branches: number;
            statements: number;
        };
        duration: number;
    }>;
    private loadApplicationMetadata;
    private request;
    private getHeaders;
    private getAuthHeaders;
    getModules(): NestJSModule[];
    getServices(): NestJSService[];
    getControllers(): NestJSController[];
    getGuards(): NestJSGuard[];
    getInterceptors(): NestJSInterceptor[];
    getPipes(): NestJSPipe[];
    getConfig(): NestJSConfig;
    updateConfig(updates: Partial<NestJSConfig>): void;
    getStats(): {
        connected: boolean;
        baseURL: string;
        moduleCount: number;
        serviceCount: number;
        controllerCount: number;
        websocketConnected: any;
        swaggerEnabled: boolean;
        graphqlEnabled: boolean;
        microservicesEnabled: boolean;
    };
}

/**
 * AI Provider Factory for Brolostack
 * Unified interface for all AI model providers
 */

declare class AIProviderFactory extends EventEmitter {
    private logger;
    private providers;
    private configs;
    constructor();
    registerProvider(config: AIProviderConfig): void;
    unregisterProvider(provider: AIProvider): void;
    generateText(provider: AIProvider, prompt: string, options?: Partial<AIProviderConfig>): Promise<AIProviderResponse>;
    chatCompletion(provider: AIProvider, messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, options?: Partial<AIProviderConfig>): Promise<AIProviderResponse>;
    streamCompletion(provider: AIProvider, prompt: string, onChunk: (chunk: string) => void, options?: Partial<AIProviderConfig>): Promise<void>;
    generateEmbedding(provider: AIProvider, text: string, options?: Partial<AIProviderConfig>): Promise<{
        embedding: number[];
        model: string;
        usage?: {
            tokens: number;
        };
    }>;
    generateImage(provider: AIProvider, prompt: string, options?: {
        size?: string;
        quality?: string;
        style?: string;
        count?: number;
    }): Promise<{
        images: Array<{
            url?: string;
            b64_json?: string;
            revised_prompt?: string;
        }>;
        created: number;
    }>;
    private createProviderAdapter;
    private getProvider;
    private mergeConfig;
    getRegisteredProviders(): AIProvider[];
    getProviderCapabilities(provider: AIProvider): AIProviderCapabilities;
    getProviderConfig(provider: AIProvider): AIProviderConfig;
    testProvider(provider: AIProvider): Promise<boolean>;
    getStats(): {
        registeredProviders: number;
        providers: AIProvider[];
    };
}

/**
 * Redis Cloud Adapter for Brolostack
 * Enterprise-grade Redis integration for caching, sessions, and real-time data
 */

interface RedisCloudConfig {
    host: string;
    port: number;
    password?: string;
    username?: string;
    database?: number;
    tls?: boolean;
    cluster?: {
        enabled: boolean;
        nodes: Array<{
            host: string;
            port: number;
        }>;
    };
    sentinel?: {
        enabled: boolean;
        masterName: string;
        sentinels: Array<{
            host: string;
            port: number;
        }>;
    };
    poolSize?: number;
    retryAttempts?: number;
    retryDelay?: number;
    commandTimeout?: number;
}
declare class RedisCloudAdapter extends EventEmitter implements CloudAdapter$1 {
    readonly name = "redis-cloud";
    readonly provider = "Redis Cloud";
    private config;
    private connected;
    private errorCount;
    private lastError?;
    private lastSync?;
    private lastBackup?;
    private logger;
    constructor(config: RedisCloudConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    get(key: string): Promise<any>;
    delete(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<boolean>;
    hset(key: string, field: string, value: any): Promise<void>;
    hget(key: string, field: string): Promise<any>;
    hgetall(key: string): Promise<Record<string, any>>;
    lpush(key: string, ...values: any[]): Promise<number>;
    rpush(key: string, ...values: any[]): Promise<number>;
    lpop(key: string): Promise<any>;
    lrange(key: string, start: number, stop: number): Promise<any[]>;
    sadd(key: string, ...members: any[]): Promise<number>;
    smembers(key: string): Promise<any[]>;
    publish(channel: string, message: any): Promise<number>;
    subscribe(channel: string, _callback: (message: any) => void): Promise<void>;
    xadd(stream: string, fields: Record<string, any>): Promise<string>;
    xread(streams: Record<string, string>, count?: number, block?: number): Promise<any>;
    getInfo(): Promise<Record<string, any>>;
    getMemoryUsage(): Promise<{
        used: number;
        peak: number;
        total: number;
        available: number;
        fragmentation: number;
    }>;
    private executeCommand;
    private getRedisEndpoint;
    private getAuthHeader;
    private generateChecksum;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
}

/**
 * MongoDB Atlas Adapter for Brolostack
 * Enterprise-grade MongoDB Atlas integration for document storage and analytics
 */

interface MongoDBAtlasConfig {
    connectionString: string;
    databaseName: string;
    collectionPrefix?: string;
    options?: {
        maxPoolSize?: number;
        minPoolSize?: number;
        maxIdleTimeMS?: number;
        serverSelectionTimeoutMS?: number;
        socketTimeoutMS?: number;
        connectTimeoutMS?: number;
        retryWrites?: boolean;
        retryReads?: boolean;
        readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
        writeConcern?: {
            w?: number | 'majority';
            j?: boolean;
            wtimeout?: number;
        };
    };
    atlas?: {
        projectId: string;
        clusterName: string;
        apiKey?: string;
        privateKey?: string;
    };
    search?: {
        enabled: boolean;
        indexName?: string;
    };
    analytics?: {
        enabled: boolean;
        pipelineTimeout?: number;
    };
}
interface MongoDBQuery {
    collection: string;
    operation: 'find' | 'findOne' | 'insertOne' | 'insertMany' | 'updateOne' | 'updateMany' | 'deleteOne' | 'deleteMany' | 'aggregate';
    filter?: Record<string, any>;
    document?: any;
    documents?: any[];
    update?: Record<string, any>;
    options?: {
        sort?: Record<string, any>;
        limit?: number;
        skip?: number;
        projection?: Record<string, any>;
        upsert?: boolean;
    };
    pipeline?: any[];
}
interface MongoDBSearchQuery {
    index: string;
    text?: {
        query: string;
        path: string | string[];
        fuzzy?: {
            maxEdits: number;
            prefixLength?: number;
            maxExpansions?: number;
        };
    };
    compound?: {
        must?: any[];
        mustNot?: any[];
        should?: any[];
        filter?: any[];
    };
    highlight?: {
        path: string | string[];
        maxCharsToExamine?: number;
        maxNumPassages?: number;
    };
    limit?: number;
    skip?: number;
}
declare class MongoDBAtlasAdapter extends EventEmitter implements CloudAdapter$1 {
    readonly name = "mongodb-atlas";
    readonly provider = "MongoDB Atlas";
    private config;
    private connected;
    private errorCount;
    private lastError?;
    private lastSync?;
    private lastBackup?;
    private logger;
    constructor(config: MongoDBAtlasConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    executeQuery(query: MongoDBQuery): Promise<any>;
    search(query: MongoDBSearchQuery): Promise<any>;
    createIndex(collection: string, indexSpec: Record<string, any>, options?: Record<string, any>): Promise<string>;
    runAggregation(collection: string, pipeline: any[]): Promise<any>;
    countDocuments(collection: string, filter?: Record<string, any>): Promise<number>;
    getCollectionStats(collection: string): Promise<{
        size: number;
        count: number;
        avgObjSize: number;
        storageSize: number;
        indexes: number;
        indexSize: number;
    }>;
    runAnalyticsPipeline(collection: string, pipeline: any[], options?: {
        timeout?: number;
        allowDiskUse?: boolean;
    }): Promise<any>;
    watchCollection(collection: string, _pipeline?: any[], callback?: (change: any) => void): Promise<() => void>;
    bulkWrite(collection: string, operations: any[]): Promise<any>;
    private getAtlasDataAPIEndpoint;
    private buildQueryBody;
    private buildSearchQuery;
    private generateChecksum;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
}

/**
 * MySQL Cloud Adapter for Brolostack
 * Enterprise-grade MySQL integration with connection pooling, transactions, and optimization
 */

interface MySQLConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: {
        enabled: boolean;
        ca?: string;
        cert?: string;
        key?: string;
        rejectUnauthorized?: boolean;
    };
    pool?: {
        min: number;
        max: number;
        acquireTimeoutMillis: number;
        idleTimeoutMillis: number;
        createTimeoutMillis: number;
        destroyTimeoutMillis: number;
        reapIntervalMillis: number;
        createRetryIntervalMillis: number;
    };
    charset?: string;
    timezone?: string;
    supportBigNumbers?: boolean;
    bigNumberStrings?: boolean;
    dateStrings?: boolean;
    multipleStatements?: boolean;
    acquireTimeout?: number;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}
interface MySQLQueryOptions {
    table: string;
    select?: string[];
    where?: Record<string, any>;
    join?: Array<{
        type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
        table: string;
        on: string;
        alias?: string;
    }>;
    groupBy?: string[];
    having?: Record<string, any>;
    orderBy?: Array<{
        column: string;
        direction: 'ASC' | 'DESC';
    }>;
    limit?: number;
    offset?: number;
}
declare class MySQLAdapter extends EventEmitter implements CloudAdapter$1 {
    readonly name = "mysql";
    readonly provider = "MySQL";
    private config;
    private connected;
    private errorCount;
    private lastError?;
    private lastSync?;
    private lastBackup?;
    private logger;
    private activeTransactions;
    constructor(config: MySQLConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    query(sql: string, params?: any[]): Promise<any[]>;
    select(options: MySQLQueryOptions): Promise<any[]>;
    insert(table: string, data: Record<string, any> | Record<string, any>[]): Promise<any>;
    update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<any>;
    delete(table: string, where: Record<string, any>): Promise<any>;
    beginTransaction(): Promise<string>;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
    queryInTransaction(transactionId: string, sql: string, params?: any[]): Promise<any[]>;
    createIndex(table: string, columns: string[], options?: {
        name?: string;
        unique?: boolean;
        type?: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
    }): Promise<void>;
    dropIndex(table: string, indexName: string): Promise<void>;
    analyze(table: string): Promise<any>;
    optimize(table: string): Promise<any>;
    getTableInfo(table: string): Promise<{
        columns: Array<{
            name: string;
            type: string;
            nullable: boolean;
            default: any;
            key: string;
            extra: string;
        }>;
        indexes: Array<{
            name: string;
            columns: string[];
            unique: boolean;
            type: string;
        }>;
        stats: {
            rows: number;
            avgRowLength: number;
            dataLength: number;
            indexLength: number;
        };
    }>;
    explainQuery(sql: string, params?: any[]): Promise<any>;
    getSlowQueries(limit?: number): Promise<any[]>;
    getConnectionInfo(): Promise<{
        activeConnections: number;
        maxConnections: number;
        threadsCached: number;
        threadsConnected: number;
        threadsCreated: number;
        threadsRunning: number;
    }>;
    private createSyncTableIfNotExists;
    private createBackupTableIfNotExists;
    private createStoreTableIfNotExists;
    private groupIndexes;
    private generateChecksum;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
}

/**
 * Universal SQL Adapter for Brolostack
 * Supports multiple SQL databases: PostgreSQL, MySQL, SQLite, SQL Server, Oracle
 */

type SQLDialect = 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'oracle' | 'mariadb';
interface SQLConfig {
    dialect: SQLDialect;
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    filename?: string;
    options?: {
        ssl?: boolean;
        pool?: {
            min: number;
            max: number;
            idle: number;
            acquire: number;
            evict: number;
        };
        timezone?: string;
        charset?: string;
        collate?: string;
        logging?: boolean;
        benchmark?: boolean;
        isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
    };
    migrations?: {
        enabled: boolean;
        directory: string;
        tableName: string;
    };
}
interface SQLQueryBuilder {
    select(columns?: string[]): SQLQueryBuilder;
    from(table: string): SQLQueryBuilder;
    where(condition: string | Record<string, any>): SQLQueryBuilder;
    join(table: string, condition: string, type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'): SQLQueryBuilder;
    groupBy(columns: string[]): SQLQueryBuilder;
    having(condition: string | Record<string, any>): SQLQueryBuilder;
    orderBy(column: string, direction?: 'ASC' | 'DESC'): SQLQueryBuilder;
    limit(count: number): SQLQueryBuilder;
    offset(count: number): SQLQueryBuilder;
    build(): {
        sql: string;
        params: any[];
    };
}
declare class SQLAdapter extends EventEmitter implements CloudAdapter$1 {
    readonly name = "sql";
    readonly provider: string;
    private config;
    private connected;
    private errorCount;
    private lastError?;
    private lastSync?;
    private lastBackup?;
    private logger;
    constructor(config: SQLConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    executeQuery(sql: string, params?: any[]): Promise<any[]>;
    createQueryBuilder(): SQLQueryBuilder;
    runMigrations(): Promise<void>;
    createMigration(name: string, up: string, down: string): Promise<string>;
    private testConnection;
    private getUpsertQuery;
    private ensureSyncTable;
    private ensureBackupTable;
    private ensureStoreTable;
    private ensureMigrationTable;
    private generateChecksum;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
    private getMaxDataSize;
}

/**
 * Universal NoSQL Adapter for Brolostack
 * Supports multiple NoSQL databases: MongoDB, CouchDB, DynamoDB, Cassandra, Redis
 */

type NoSQLDialect = 'mongodb' | 'couchdb' | 'dynamodb' | 'cassandra' | 'redis' | 'elasticsearch' | 'neo4j';
interface NoSQLConfig {
    dialect: NoSQLDialect;
    connectionString?: string;
    host?: string;
    port?: number;
    database?: string;
    keyspace?: string;
    index?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    authSource?: string;
    replicaSet?: string;
    options?: {
        poolSize?: number;
        bufferMaxEntries?: number;
        useNewUrlParser?: boolean;
        useUnifiedTopology?: boolean;
        serverSelectionTimeoutMS?: number;
        heartbeatFrequencyMS?: number;
        maxStalenessSeconds?: number;
        readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
        writeConcern?: {
            w?: number | 'majority';
            j?: boolean;
            wtimeout?: number;
        };
    };
    aws?: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
    };
    elasticsearch?: {
        node: string;
        auth?: {
            username: string;
            password: string;
        };
        ssl?: {
            ca?: string;
            cert?: string;
            key?: string;
        };
    };
}
interface NoSQLQuery {
    collection?: string;
    table?: string;
    keyspace?: string;
    index?: string;
    operation: 'find' | 'findOne' | 'insert' | 'update' | 'delete' | 'aggregate' | 'search';
    filter?: Record<string, any>;
    document?: any;
    documents?: any[];
    update?: Record<string, any>;
    pipeline?: any[];
    options?: {
        sort?: Record<string, any>;
        limit?: number;
        skip?: number;
        projection?: Record<string, any>;
        upsert?: boolean;
        multi?: boolean;
    };
    searchQuery?: any;
}
interface NoSQLIndex {
    name: string;
    fields: Record<string, 1 | -1 | 'text' | '2dsphere'>;
    options?: {
        unique?: boolean;
        sparse?: boolean;
        background?: boolean;
        expireAfterSeconds?: number;
        partialFilterExpression?: Record<string, any>;
    };
}
declare class NoSQLAdapter extends EventEmitter implements CloudAdapter$1 {
    readonly name = "nosql";
    readonly provider: string;
    private config;
    private connected;
    private errorCount;
    private lastError?;
    private lastSync?;
    private lastBackup?;
    private logger;
    constructor(config: NoSQLConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    sync(data: any): Promise<void>;
    backup(data: any): Promise<void>;
    restore(): Promise<any>;
    syncStore(storeName: string, data: any): Promise<void>;
    restoreStore(storeName: string): Promise<any>;
    executeQuery(query: NoSQLQuery): Promise<any>;
    findDocuments(collection: string, filter?: Record<string, any>, options?: {
        sort?: Record<string, any>;
        limit?: number;
        skip?: number;
        projection?: Record<string, any>;
    }): Promise<any[]>;
    insertDocument(collection: string, document: any): Promise<any>;
    updateDocument(collection: string, filter: Record<string, any>, update: Record<string, any>, options?: {
        upsert?: boolean;
        multi?: boolean;
    }): Promise<any>;
    aggregateDocuments(collection: string, pipeline: any[]): Promise<any[]>;
    searchDocuments(index: string, searchQuery: any, options?: {
        from?: number;
        size?: number;
        sort?: any[];
        highlight?: any;
    }): Promise<any>;
    indexDocument(index: string, document: any, id?: string): Promise<any>;
    putItem(table: string, item: Record<string, any>): Promise<any>;
    getItem(table: string, key: Record<string, any>): Promise<any>;
    scanTable(table: string, filter?: Record<string, any>, options?: {
        limit?: number;
        startKey?: Record<string, any>;
        projection?: string[];
    }): Promise<any>;
    executeCQL(cql: string, params?: any[]): Promise<any>;
    createIndex(indexConfig: NoSQLIndex): Promise<void>;
    dropIndex(indexName: string, collection?: string): Promise<void>;
    listIndexes(collection?: string): Promise<any[]>;
    getCollectionStats(collection: string): Promise<{
        documentCount: number;
        storageSize: number;
        averageDocumentSize: number;
        indexCount: number;
        indexSize: number;
    }>;
    getPerformanceMetrics(): Promise<{
        operationsPerSecond: number;
        averageLatency: number;
        connectionCount: number;
        memoryUsage: number;
        diskUsage: number;
    }>;
    watchCollection(collection: string, callback: (change: any) => void): Promise<() => void>;
    bulkWrite(collection: string, operations: any[]): Promise<any>;
    private testConnection;
    private cleanOldRecords;
    private generateChecksum;
    getStatus(): CloudAdapterStatus;
    getCapabilities(): CloudAdapterCapabilities;
}

/**
 * Complete Implementation of All 20 AI Model Providers
 * Enterprise-grade adapters for every major AI provider
 */

declare class PerplexityAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void>;
    generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}
declare class IBMWatsonAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void>;
    generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}
declare class MiniMaxAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void>;
    generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}
declare class DatabricksAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void>;
    generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}
declare class XAIAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void>;
    generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}
declare class ClarifaiAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void>;
    generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
    analyzeImage(image: string | Blob, prompt?: string): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
    private blobToBase64;
}
declare class TogetherAIAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void>;
    generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}
declare class NLPCloudAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void>;
    generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}
declare class AIMAPIAdapter extends BaseAIAdapter {
    generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
    chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
    streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void>;
    generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
    getCapabilities(): AIProviderCapabilities;
    healthCheck(): Promise<void>;
}

/**
 * Security Manager for Brolostack Worker
 * Implements web-cryptographic security and blockchain-like verification system
 * Ensures data integrity, confidentiality, and authenticity across all operations
 */

interface SecurityConfig {
    encryption: {
        enabled: boolean;
        algorithm: 'AES-GCM' | 'ChaCha20-Poly1305' | 'AES-CBC';
        keySize: 128 | 192 | 256;
        keyDerivation: 'PBKDF2' | 'scrypt' | 'Argon2';
        keyRotationInterval: number;
        saltSize: number;
    };
    blockchain: {
        enabled: boolean;
        networkType: 'private' | 'consortium' | 'public';
        consensusAlgorithm: 'PoW' | 'PoS' | 'PBFT' | 'Raft';
        blockSize: number;
        difficulty: number;
        miningReward: number;
        validatorNodes: string[];
    };
    authentication: {
        multiFactorRequired: boolean;
        biometricEnabled: boolean;
        sessionTimeout: number;
        tokenRotationInterval: number;
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSymbols: boolean;
            preventReuse: number;
        };
    };
    audit: {
        enabled: boolean;
        logLevel: 'minimal' | 'standard' | 'detailed' | 'verbose';
        retention: number;
        tamperProof: boolean;
        realTimeMonitoring: boolean;
    };
    compliance: {
        frameworks: Array<'SOC2' | 'HIPAA' | 'GDPR' | 'PCI-DSS' | 'ISO27001' | 'FedRAMP'>;
        dataClassification: {
            enabled: boolean;
            levels: Array<'public' | 'internal' | 'confidential' | 'restricted'>;
            autoClassification: boolean;
        };
        dataResidency: {
            enabled: boolean;
            allowedRegions: string[];
            crossBorderRestrictions: boolean;
        };
    };
}
interface SecurityBlock {
    index: number;
    timestamp: number;
    previousHash: string;
    merkleRoot: string;
    nonce: number;
    difficulty: number;
    transactions: SecurityTransaction[];
    hash: string;
    validator?: string;
    signature?: string;
}
interface SecurityTransaction {
    id: string;
    type: 'data-access' | 'data-modification' | 'key-rotation' | 'authentication' | 'authorization' | 'data-encryption' | 'data-decryption' | 'signature-verification' | 'data-integrity-check';
    userId: string;
    sessionId: string;
    operation: string;
    resource: string;
    dataHash: string;
    timestamp: number;
    metadata: {
        ipAddress?: string;
        userAgent?: string;
        geolocation?: string;
        riskScore?: number;
        algorithm?: string;
        signatureValid?: boolean;
        expectedHash?: string;
        actualHash?: string;
        isValid?: boolean;
        authorized?: boolean;
        securityLevel?: string;
        auditRequired?: boolean;
        oldKeyRotationCount?: number;
        newKeyRotationCount?: number;
        operationCount?: number;
        transactionType?: string;
    };
    signature: string;
}
interface AuditLog {
    id: string;
    timestamp: Date;
    userId: string;
    sessionId: string;
    operation: string;
    resource: string;
    result: 'success' | 'failure' | 'blocked';
    riskScore: number;
    securityLevel: string;
    metadata: {
        ipAddress: string;
        userAgent: string;
        dataClassification?: string;
        complianceFlags?: string[];
        executionTime?: number;
        error?: string;
    };
    blockHash?: string;
    integrity: {
        verified: boolean;
        signature: string;
        tamperProof: boolean;
    };
}
declare class SecurityManager extends EventEmitter {
    private config;
    private logger;
    private cryptoKeys;
    private blockchain;
    private auditLogs;
    private riskAssessment;
    private complianceMonitor;
    private keyRotationTimer?;
    constructor(config: SecurityConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    encryptData(data: any, keyId?: string, metadata?: any): Promise<{
        encryptedData: string;
        keyId: string;
        algorithm: string;
        iv: string;
        authTag?: string;
        metadata?: any;
    }>;
    decryptData(encryptedData: string, keyId: string, iv: string, metadata?: any): Promise<any>;
    signData(data: any, keyId?: string): Promise<{
        signature: string;
        keyId: string;
        algorithm: string;
        timestamp: number;
    }>;
    verifySignature(data: any, signature: string, keyId: string): Promise<boolean>;
    createSecurityBlock(transactions: SecurityTransaction[]): Promise<SecurityBlock>;
    verifyBlockchain(): Promise<boolean>;
    authorizeOperation(userId: string, operation: string, resource: string, context?: any): Promise<{
        authorized: boolean;
        riskScore: number;
        securityLevel: string;
        restrictions?: string[];
        auditRequired: boolean;
    }>;
    verifyDataIntegrity(data: any, expectedHash: string): Promise<boolean>;
    createDataChecksum(data: any): Promise<{
        hash: string;
        algorithm: string;
        timestamp: number;
        signature: string;
    }>;
    executeOperation(message: any): Promise<any>;
    private initializeCryptography;
    private initializeBlockchain;
    private initializeAuditSystem;
    private initializeComplianceMonitoring;
    private getOrCreateKey;
    private getKey;
    private isKeyExpired;
    private hashData;
    private calculateMerkleRoot;
    private calculateBlockHash;
    private mineBlock;
    private selectValidator;
    private logSecurityEvent;
    private addTransactionToQueue;
    private createAuditLog;
    private calculateRiskScore;
    private determineSecurityLevel;
    private checkAuthorization;
    private isAuditRequired;
    private isUnknownIP;
    private isUnusualLocation;
    private rotateAuditLogs;
    private finalizeAuditLogs;
    private secureBlockchainState;
    private startKeyRotation;
    private rotateKeys;
    private performComplianceCheck;
    private queryAuditLogs;
    private createSecureTransaction;
    getSecurityMetrics(): {
        encryptionEnabled: boolean;
        blockchainEnabled: boolean;
        totalBlocks: number;
        totalTransactions: number;
        keyCount: number;
        auditLogCount: number;
        complianceStatus: any;
        lastKeyRotation: Date | null;
    };
    getBlockchain(): SecurityBlock[];
    getAuditLogs(limit?: number): AuditLog[];
}

/**
 * CRUD Manager for Brolostack Worker
 * Handles all database operations across multiple providers with optimistic updates,
 * conflict resolution, and intelligent caching
 */

interface DatabaseConfig {
    providers: Array<{
        name: string;
        type: 'sql' | 'nosql' | 'graph' | 'cache' | 'search';
        config: any;
        priority: number;
        enabled: boolean;
        capabilities: string[];
        regions?: string[];
    }>;
    defaultProvider: string;
    sharding: {
        enabled: boolean;
        strategy: 'range' | 'hash' | 'directory' | 'consistent-hash';
        shardKey: string;
        shardCount: number;
    };
    replication: {
        enabled: boolean;
        factor: number;
        consistency: 'eventual' | 'strong' | 'bounded' | 'causal';
        readPreference: 'primary' | 'secondary' | 'nearest';
    };
    caching: {
        enabled: boolean;
        provider: string;
        ttl: number;
        maxSize: number;
        evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
    };
    conflictResolution: {
        strategy: 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual' | 'vector-clock';
        mergeFunction?: string;
        vectorClockEnabled: boolean;
    };
}
interface CRUDOperation {
    id: string;
    type: 'create' | 'read' | 'update' | 'delete' | 'batch';
    provider: string;
    collection: string;
    data?: any;
    filter?: any;
    options?: {
        upsert?: boolean;
        multi?: boolean;
        sort?: any;
        limit?: number;
        skip?: number;
        projection?: any;
        transaction?: boolean;
        timeout?: number;
    };
    metadata: {
        userId: string;
        sessionId: string;
        timestamp: number;
        version?: number;
        vectorClock?: Record<string, number>;
        optimistic?: boolean;
    };
}
interface CRUDResult {
    success: boolean;
    data?: any;
    error?: {
        code: string;
        message: string;
        recoverable: boolean;
        retryAfter?: number;
    };
    metadata: {
        provider: string;
        executionTime: number;
        cacheHit: boolean;
        conflictDetected: boolean;
        replicationStatus?: 'pending' | 'completed' | 'failed';
        consistencyLevel: string;
    };
}
interface ConflictResolution {
    conflictId: string;
    operation: CRUDOperation;
    localVersion: any;
    remoteVersion: any;
    resolution: 'local' | 'remote' | 'merged' | 'manual';
    mergedData?: any;
    timestamp: Date;
    resolvedBy: string;
}
interface OptimisticUpdate {
    id: string;
    operation: CRUDOperation;
    localData: any;
    applied: boolean;
    confirmed: boolean;
    rollbackData?: any;
    timestamp: Date;
    ttl: number;
}
declare class CRUDManager extends EventEmitter {
    private config;
    private logger;
    private providers;
    private cache;
    private optimisticUpdates;
    private conflictQueue;
    private operationHistory;
    private performanceMetrics;
    constructor(config: DatabaseConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    executeOperation(operation: CRUDOperation): Promise<CRUDResult>;
    executeBatchOperation(operations: CRUDOperation[]): Promise<CRUDResult[]>;
    syncData(storeName: string, localData: any, providers?: string[]): Promise<{
        conflicts: ConflictResolution[];
        syncResults: Record<string, CRUDResult>;
        finalData: any;
    }>;
    applyOptimisticUpdate(operation: CRUDOperation): Promise<void>;
    confirmOptimisticUpdate(operationId: string, result: CRUDResult): Promise<void>;
    rollbackOptimisticUpdate(operationId: string): Promise<void>;
    detectConflict(localData: any, remoteData: any, _resource: string): Promise<ConflictResolution | null>;
    resolveConflict(conflict: ConflictResolution, localData: any, remoteData: any): Promise<ConflictResolution>;
    private initializeProvider;
    private selectProvider;
    private isProviderSuitable;
    private getProviderScore;
    private executeOnProvider;
    private initializeCache;
    private getCachedResult;
    private updateCache;
    private generateCacheKey;
    private evictCacheEntries;
    private applyLocalUpdate;
    private mergeData;
    private mergeObjects;
    private compareVectorClocks;
    private deepCompare;
    private validateOperation;
    private isRecoverableError;
    private replicateOperation;
    private startConflictResolutionProcessor;
    private processConflictQueue;
    private startOptimisticUpdateCleanup;
    private cleanupExpiredOptimisticUpdates;
    private startPerformanceMonitoring;
    private calculatePerformanceMetrics;
    private updatePerformanceMetrics;
    private logOperation;
    private getProviderStats;
    private processRemainingOptimisticUpdates;
    private resolveRemainingConflicts;
    getProviders(): string[];
    getOperationHistory(collection?: string): CRUDOperation[];
    getOptimisticUpdates(): OptimisticUpdate[];
    getConflictQueue(): ConflictResolution[];
    getPerformanceMetrics(): {
        operationsPerSecond: number;
        averageLatency: number;
        cacheHitRate: number;
        conflictRate: number;
        errorRate: number;
    };
    getCacheStats(): {
        size: number;
        hitRate: number;
        maxSize: number;
        evictionPolicy: string;
    };
    getAIProviderStats(): any;
    getCloudProviderStats(): any;
}

/**
 * Pre-built Application Templates for Brolostack Worker
 * Ready-to-use configurations for 12 common application types
 */

interface ApplicationTemplate {
    name: string;
    description: string;
    category: 'full-stack' | 'ai-application';
    complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedSetupTime: string;
    requiredProviders: {
        ai?: string[];
        cloud?: string[];
        database?: string[];
    };
    stores: Array<{
        name: string;
        type: 'primary' | 'cache' | 'analytics' | 'temporary';
        schema: any;
        providers: string[];
        syncInterval: number;
        conflictResolution: string;
    }>;
    realTimeChannels: Array<{
        name: string;
        purpose: string;
        subscribers: string[];
        messageTypes: string[];
    }>;
    securityPolicies: Array<{
        resource: string;
        classification: 'public' | 'internal' | 'confidential' | 'restricted';
        encryption: boolean;
        auditRequired: boolean;
        complianceFrameworks: string[];
    }>;
    workerConfig: Partial<BrolostackWorkerConfig>;
    setupInstructions: string[];
    codeExamples: {
        initialization: string;
        basicUsage: string;
        advancedFeatures: string;
    };
}
declare class ApplicationTemplates {
    private static templates;
    static getTemplate(applicationType: string): ApplicationTemplate | null;
    static getAllTemplates(): ApplicationTemplate[];
    static getTemplatesByCategory(category: 'full-stack' | 'ai-application'): ApplicationTemplate[];
    static getTemplatesByComplexity(complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert'): ApplicationTemplate[];
    static validateTemplate(template: ApplicationTemplate): {
        valid: boolean;
        errors: string[];
        warnings: string[];
    };
    static generateWorkerConfig(template: ApplicationTemplate, customConfig?: any): BrolostackWorkerConfig;
    private static deepMerge;
}

/**
 * 🔍 Brolostack Security Auditor
 * Comprehensive security audit and vulnerability assessment system
 * Ensures production readiness with zero vulnerabilities
 */

interface SecurityAuditConfig {
    scope: {
        codeAnalysis: boolean;
        dependencyCheck: boolean;
        configurationAudit: boolean;
        runtimeSecurity: boolean;
        dataProtection: boolean;
    };
    severity: {
        critical: boolean;
        high: boolean;
        medium: boolean;
        low: boolean;
        informational: boolean;
    };
    compliance: {
        standards: ('OWASP' | 'NIST' | 'ISO27001' | 'SOC2' | 'GDPR' | 'HIPAA')[];
        customRules: any[];
    };
    reporting: {
        detailedReport: boolean;
        executiveSummary: boolean;
        remediationSteps: boolean;
        complianceMapping: boolean;
    };
}
interface SecurityVulnerability {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
    category: string;
    title: string;
    description: string;
    location: {
        file?: string;
        line?: number;
        function?: string;
    };
    impact: string;
    remediation: string;
    compliance: string[];
    cvss: number;
    cwe: string;
}
interface SecurityAuditResult {
    overall: {
        score: number;
        status: 'secure' | 'warning' | 'vulnerable' | 'critical';
        vulnerabilityCount: number;
        timestamp: number;
    };
    vulnerabilities: SecurityVulnerability[];
    categories: {
        injection: {
            count: number;
            severity: string;
        };
        authentication: {
            count: number;
            severity: string;
        };
        encryption: {
            count: number;
            severity: string;
        };
        configuration: {
            count: number;
            severity: string;
        };
        dependencies: {
            count: number;
            severity: string;
        };
    };
    compliance: {
        owasp: {
            score: number;
            issues: string[];
        };
        nist: {
            score: number;
            issues: string[];
        };
        gdpr: {
            score: number;
            issues: string[];
        };
    };
    recommendations: string[];
    remediationPlan: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
}
declare class SecurityAuditor extends EventEmitter {
    private config;
    private logger;
    private auditHistory;
    constructor(config?: Partial<SecurityAuditConfig>);
    /**
     * 🔍 COMPREHENSIVE SECURITY AUDIT
     */
    performSecurityAudit(): Promise<SecurityAuditResult>;
    /**
     * 🔍 CODE SECURITY ANALYSIS
     */
    private analyzeCodeSecurity;
    /**
     * 🔍 DEPENDENCY ANALYSIS
     */
    private analyzeDependencies;
    /**
     * 🔍 CONFIGURATION AUDIT
     */
    private auditConfiguration;
    /**
     * 🔍 RUNTIME SECURITY ANALYSIS
     */
    private analyzeRuntimeSecurity;
    /**
     * 🔍 DATA PROTECTION ANALYSIS
     */
    private analyzeDataProtection;
    /**
     * 🔍 CALCULATE SECURITY SCORE
     */
    private calculateSecurityScore;
    /**
     * 🔍 DETERMINE SECURITY STATUS
     */
    private determineSecurityStatus;
    /**
     * 🔍 GET AUDIT REPORT
     */
    getLatestAuditReport(): SecurityAuditResult | null;
    /**
     * 🔍 GET SECURITY STATUS
     */
    getSecurityStatus(): {
        lastAudit: number | null;
        securityScore: number;
        status: string;
        vulnerabilityCount: number;
        auditCount: number;
        isSecure: boolean;
    };
    private createDefaultConfig;
    private categorizeVulnerabilities;
    private assessCompliance;
    private generateRecommendations;
    private createRemediationPlan;
}
/**
 * 🔍 GET SECURITY AUDITOR INSTANCE
 */
declare function getSecurityAuditor(config?: Partial<SecurityAuditConfig>): SecurityAuditor;
/**
 * 🔍 SECURITY UTILITIES
 */
declare const SecurityAudit: {
    /**
     * Quick security check
     */
    quickCheck: () => Promise<SecurityAuditResult>;
    /**
     * Get security status
     */
    status: () => {
        lastAudit: number | null;
        securityScore: number;
        status: string;
        vulnerabilityCount: number;
        auditCount: number;
        isSecure: boolean;
    };
    /**
     * Production readiness check
     */
    isProductionReady: () => Promise<boolean>;
};

/**
 * Brolostack Console Module - Type Definitions
 * Client-side bridge for the Brolostack Console platform
 * Provides secure telemetry and control capabilities
 */
interface ConsoleConfig {
    appId: string;
    consoleAuthKey: string;
    registrationUrl: string;
    telemetryUrl?: string;
    enableTelemetry?: boolean;
    telemetryInterval?: number;
    environment?: string;
    encryptTelemetry?: boolean;
    enableDeviceFingerprinting?: boolean;
    features?: {
        aiGovernance?: boolean;
        cloudSync?: boolean;
        webSocketMonitoring?: boolean;
        securityAudit?: boolean;
        performanceMetrics?: boolean;
        deviceFingerprinting?: boolean;
        realTimeAnalytics?: boolean;
    };
}
interface AppRegistrationPayload {
    appId: string;
    version: string;
    timestamp: string;
    browserInfo: string;
    environment: string;
    metadata: {
        encryptedPayload: string;
        deviceFingerprint?: string;
        capabilities: string[];
    };
}
interface TelemetryData {
    appId: string;
    timestamp: string;
    environment: string;
    performance?: {
        bundleSize: number;
        loadTime: number;
        memoryUsage: number;
        storageUsage: number;
    };
    ai?: {
        activeProviders: string[];
        tokenUsage: {
            input: number;
            output: number;
            cost: number;
        };
        governanceEvents: number;
        reasoningFrameworkUsage: Record<string, number>;
    };
    security?: {
        encryptionOperations: number;
        securityEvents: number;
        devilProtectionActive: boolean;
        sourceCodeProtected: boolean;
    };
    realtime?: {
        activeConnections: number;
        messagesSent: number;
        messagesReceived: number;
        averageLatency: number;
    };
    cloud?: {
        activeAdapters: string[];
        syncEvents: number;
        lastSyncTime: string;
        conflictResolutions: number;
    };
    auth?: {
        activeProviders: string[];
        sessionCount: number;
        mfaEnabled: boolean;
        lastLoginTime: string;
    };
}
interface ConsoleEvent {
    id: string;
    appId: string;
    type: ConsoleEventType;
    timestamp: string;
    data: any;
    severity: 'info' | 'warning' | 'error' | 'critical';
    encrypted: boolean;
}
type ConsoleEventType = 'app_registered' | 'telemetry_sent' | 'ai_request' | 'ai_governance_violation' | 'security_event' | 'cloud_sync' | 'websocket_connection' | 'authentication_event' | 'performance_alert' | 'error_occurred';
interface ConsoleStatus {
    connected: boolean;
    registered: boolean;
    telemetryActive: boolean;
    lastTelemetryTime?: string;
    errorCount: number;
    lastError?: string;
}
interface ConsoleStats {
    appId: string;
    uptime: number;
    totalEvents: number;
    telemetryEvents: number;
    errorEvents: number;
    errorCount: number;
    lastActivity: string;
    dataTransferred: number;
    encryptionOperations: number;
}
interface ConsoleResponse {
    success: boolean;
    message: string;
    timestamp: string;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
interface AIKeyConfig {
    provider: string;
    encryptedKey: string;
    retrievalToken: string;
    proxyEndpoint: string;
    maxTokensPerRequest?: number;
    costLimits?: {
        daily: number;
        monthly: number;
    };
}
interface ConsolePlatformConfig {
    platformUrl: string;
    apiEndpoint: string;
    wsEndpoint: string;
    cdnEndpoint: string;
    workers: {
        aiProxy: string;
        telemetry: string;
        registration: string;
    };
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey?: string;
    };
}
interface DeviceFingerprint {
    userAgent: string;
    screen: {
        width: number;
        height: number;
        colorDepth: number;
    };
    timezone: string;
    language: string;
    platform: string;
    cookiesEnabled: boolean;
    localStorageEnabled: boolean;
    sessionStorageEnabled: boolean;
    indexedDBEnabled: boolean;
    hash: string;
}
interface ConsoleError {
    code: string;
    message: string;
    timestamp: string;
    context?: any;
    recoverable: boolean;
    retryAfter?: number;
}
interface ConsoleMetrics {
    health: {
        status: 'healthy' | 'warning' | 'error' | 'critical';
        score: number;
        lastCheck: string;
    };
    framework: {
        version: string;
        featuresEnabled: string[];
        moduleUsage: Record<string, number>;
    };
    resources: {
        memoryUsage: number;
        storageUsage: number;
        networkUsage: number;
        cpuUsage?: number;
    };
    engagement?: {
        activeUsers: number;
        sessionDuration: number;
        pageViews: number;
        interactions: number;
    };
}

/**
 * Brolostack Console Module - Enums and Constants
 * Standardized enums for console operations and status management
 */
declare enum ConsoleConnectionState {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    REGISTERED = "registered",
    STREAMING = "streaming",
    ERROR = "error",
    RECONNECTING = "reconnecting"
}
declare enum ConsoleOperationType {
    REGISTER_APP = "register_app",
    START_TELEMETRY = "start_telemetry",
    STOP_TELEMETRY = "stop_telemetry",
    SEND_EVENT = "send_event",
    UPDATE_CONFIG = "update_config",
    HEALTH_CHECK = "health_check",
    SYNC_STATUS = "sync_status"
}
declare enum ConsoleEventSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
declare enum ConsoleFeature {
    AI_GOVERNANCE = "ai_governance",
    CLOUD_SYNC = "cloud_sync",
    WEBSOCKET_MONITORING = "websocket_monitoring",
    SECURITY_AUDIT = "security_audit",
    PERFORMANCE_METRICS = "performance_metrics",
    DEVICE_FINGERPRINTING = "device_fingerprinting",
    REAL_TIME_ANALYTICS = "real_time_analytics"
}
declare enum ConsoleErrorCode {
    CONNECTION_FAILED = "CONNECTION_FAILED",
    REGISTRATION_FAILED = "REGISTRATION_FAILED",
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
    NETWORK_ERROR = "NETWORK_ERROR",
    INVALID_CONFIG = "INVALID_CONFIG",
    MISSING_APP_ID = "MISSING_APP_ID",
    MISSING_AUTH_KEY = "MISSING_AUTH_KEY",
    INVALID_URL = "INVALID_URL",
    ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
    DECRYPTION_FAILED = "DECRYPTION_FAILED",
    INVALID_SIGNATURE = "INVALID_SIGNATURE",
    SECURITY_VIOLATION = "SECURITY_VIOLATION",
    TELEMETRY_FAILED = "TELEMETRY_FAILED",
    DATA_COLLECTION_FAILED = "DATA_COLLECTION_FAILED",
    SERIALIZATION_FAILED = "SERIALIZATION_FAILED",
    PLATFORM_UNAVAILABLE = "PLATFORM_UNAVAILABLE",
    RATE_LIMITED = "RATE_LIMITED",
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
    FRAMEWORK_NOT_INITIALIZED = "FRAMEWORK_NOT_INITIALIZED",
    MODULE_NOT_AVAILABLE = "MODULE_NOT_AVAILABLE",
    INCOMPATIBLE_VERSION = "INCOMPATIBLE_VERSION"
}
declare enum ConsoleHealthStatus {
    HEALTHY = "healthy",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical",
    UNKNOWN = "unknown"
}
declare enum TelemetryInterval {
    REAL_TIME = 1000,// 1 second
    FAST = 5000,// 5 seconds
    NORMAL = 30000,// 30 seconds
    SLOW = 300000,// 5 minutes
    MINIMAL = 3600000
}
declare enum ConsoleEnvironment {
    DEVELOPMENT = "development",
    TESTING = "testing",
    STAGING = "staging",
    PRODUCTION = "production"
}
declare enum ConsoleEncryptionLevel {
    NONE = "none",
    BASIC = "basic",
    STANDARD = "standard",
    MAXIMUM = "maximum",
    DEVIL = "devil"
}
declare const CONSOLE_ENDPOINTS: {
    readonly REGISTRATION: "/api/v1/apps/register";
    readonly TELEMETRY: "/api/v1/telemetry";
    readonly EVENTS: "/api/v1/events";
    readonly HEALTH: "/api/v1/health";
    readonly CONFIG: "/api/v1/config";
    readonly AI_PROXY: "/api/v1/ai/proxy";
    readonly WEBSOCKET: "/ws/v1/console";
};
declare const CONSOLE_DEFAULTS: {
    readonly TELEMETRY_INTERVAL: TelemetryInterval.NORMAL;
    readonly ENCRYPTION_LEVEL: ConsoleEncryptionLevel.DEVIL;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 1000;
    readonly HEALTH_CHECK_INTERVAL: 60000;
    readonly MAX_EVENT_QUEUE_SIZE: 1000;
    readonly MAX_TELEMETRY_BATCH_SIZE: 100;
    readonly CONNECTION_TIMEOUT: 30000;
    readonly FEATURES: {
        readonly ai_governance: true;
        readonly cloud_sync: true;
        readonly websocket_monitoring: true;
        readonly security_audit: true;
        readonly performance_metrics: true;
        readonly device_fingerprinting: true;
        readonly real_time_analytics: true;
    };
};
declare const CONSOLE_VERSION: {
    readonly MODULE_VERSION: "1.0.2";
    readonly API_VERSION: "v1";
    readonly PROTOCOL_VERSION: "1.0";
    readonly COMPATIBILITY: {
        readonly MIN_BROLOSTACK_VERSION: "1.0.0";
        readonly MAX_BROLOSTACK_VERSION: "2.0.0";
    };
};
declare enum ConsoleCapability {
    REAL_TIME_TELEMETRY = "real_time_telemetry",
    ENCRYPTED_COMMUNICATION = "encrypted_communication",
    DEVICE_FINGERPRINTING = "device_fingerprinting",
    AI_GOVERNANCE_MONITORING = "ai_governance_monitoring",
    CLOUD_SYNC_MONITORING = "cloud_sync_monitoring",
    WEBSOCKET_MONITORING = "websocket_monitoring",
    SECURITY_AUDIT = "security_audit",
    PERFORMANCE_METRICS = "performance_metrics",
    ERROR_TRACKING = "error_tracking",
    CUSTOM_EVENTS = "custom_events"
}

/**
 * Brolostack Console Module - Utility Functions
 * Helper functions for console operations and data processing
 */

declare class ConsoleUtils {
    private static logger;
    /**
     * Validate console configuration
     */
    static validateConfig(config: ConsoleConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Check if URL is valid
     */
    static isValidUrl(url: string): boolean;
    /**
     * Check if appId format is valid
     */
    static isValidAppId(appId: string): boolean;
    /**
     * Create error object
     */
    static createError(code: ConsoleErrorCode, message: string, context?: any, recoverable?: boolean): ConsoleError;
    /**
     * Check if environment allows console operations
     */
    static shouldEnableConsole(): boolean;
    /**
     * Get framework version compatibility
     */
    static checkVersionCompatibility(frameworkVersion: string): boolean;
    /**
     * Compare version strings
     */
    static compareVersions(version1: string, version2: string): number;
    /**
     * Sanitize data for transmission
     */
    static sanitizeData(data: any): any;
    /**
     * Deep sanitize object recursively
     */
    private static deepSanitize;
    /**
     * Calculate data size in bytes
     */
    static calculateDataSize(data: any): number;
    /**
     * Check if data exceeds size limit
     */
    static isDataSizeValid(data: any, maxSizeBytes?: number): boolean;
    /**
     * Create health status based on metrics
     */
    static calculateHealthStatus(metrics: any): ConsoleHealthStatus;
    /**
     * Format bytes to human readable
     */
    static formatBytes(bytes: number): string;
    /**
     * Format duration to human readable
     */
    static formatDuration(ms: number): string;
    /**
     * Create secure headers for API requests
     */
    static createSecureHeaders(authKey: string): Record<string, string>;
    /**
     * Retry function with exponential backoff
     */
    static retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
    /**
     * Sleep utility
     */
    static sleep(ms: number): Promise<void>;
    /**
     * Check if running in browser
     */
    static isBrowser(): boolean;
    /**
     * Check if console features are supported
     */
    static checkBrowserSupport(): {
        supported: boolean;
        missing: string[];
    };
    /**
     * Log console operation
     */
    static logOperation(operation: string, data?: any): void;
    /**
     * Create console response
     */
    static createResponse(success: boolean, message: string, data?: any, error?: any): ConsoleResponse;
}

/**
 * Brolostack Console Module - Main Class
 * Client-side bridge for the Brolostack Console platform
 * Provides secure telemetry and control capabilities
 */

declare class BrolostackConsole extends EventEmitter {
    private config;
    private worker;
    private eventManager;
    private secretsManager;
    private platformIntegration;
    private logger;
    private status;
    private stats;
    private startTime;
    private telemetryTimer;
    private healthCheckTimer?;
    constructor(config: ConsoleConfig);
    /**
     * Initialize the console module
     */
    initialize(): Promise<void>;
    /**
     * Register application with console platform
     */
    registerApp(): Promise<ConsoleResponse>;
    /**
     * Start telemetry streaming
     */
    startTelemetryStreaming(): Promise<void>;
    /**
     * Stop telemetry streaming
     */
    stopTelemetryStreaming(): void;
    /**
     * Send telemetry data to console platform
     */
    private sendTelemetry;
    /**
     * Send custom event to console platform
     */
    sendEvent(type: string, data: any, severity?: 'info' | 'warning' | 'error' | 'critical'): Promise<void>;
    /**
     * Get console status
     */
    getStatus(): ConsoleStatus;
    /**
     * Get console statistics
     */
    getStats(): ConsoleStats;
    /**
     * Get console health metrics
     */
    getHealthMetrics(): Promise<ConsoleMetrics>;
    /**
     * 🤖 CONNECT AI PROVIDER (One-Line Setup)
     * Seamlessly connects AI provider using platform-managed keys
     */
    connectAIProvider(providerName: string, options?: {
        model?: string;
        useCase?: 'flagship' | 'performance' | 'cost-effective' | 'coding' | 'embedding';
        reasoning?: {
            framework?: 'react' | 'cot' | 'tot' | 'cotsc' | 'hybrid';
            reactConfig?: any;
            cotConfig?: any;
            totConfig?: any;
            cotscConfig?: any;
        };
        governance?: {
            enabled?: boolean;
            config?: any;
            realTimeMonitoring?: boolean;
            safetyFirst?: boolean;
        };
        tokenUsage?: {
            controlLevel?: 'basic' | 'strict' | 'advanced';
            maxTokensPerRequest?: number;
            dailyLimit?: number;
            monthlyLimit?: number;
            costThreshold?: number;
        };
        memory?: {
            enabled?: boolean;
            contextWindow?: number;
            semanticSearch?: boolean;
            vectorSearch?: boolean;
            persistentMemory?: boolean;
        };
        websocket?: {
            enabled?: boolean;
            realTimeUpdates?: boolean;
            multiAgentSupport?: boolean;
            streamingResponses?: boolean;
        };
        backend?: {
            enabled?: boolean;
            framework?: 'express' | 'nestjs' | 'fastify' | 'fastapi' | 'django' | 'flask' | 'none';
            endpoints?: string[];
        };
        tools?: {
            enabled?: boolean;
            customTools?: string[];
            externalIntegrations?: string[];
        };
        performance?: {
            enabled?: boolean;
            caching?: boolean;
            rateLimiting?: boolean;
            optimization?: boolean;
        };
    }): Promise<any>;
    /**
     * ☁️ CONNECT CLOUD PROVIDER (One-Line Setup)
     * Seamlessly connects cloud provider using platform-managed credentials
     */
    connectCloudProvider(providerName: string, options?: {
        adapterConfig?: any;
        syncStrategy?: 'local-first' | 'cloud-first' | 'hybrid';
        conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
        backup?: {
            enabled?: boolean;
            frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
            retention?: number;
            compression?: boolean;
            encryption?: boolean;
        };
        sync?: {
            enabled?: boolean;
            realTime?: boolean;
            batchSize?: number;
            retryAttempts?: number;
            conflictDetection?: boolean;
        };
        storage?: {
            caching?: boolean;
            compression?: boolean;
            encryption?: boolean;
            redundancy?: 'single' | 'dual' | 'triple';
            region?: string;
        };
        performance?: {
            connectionPooling?: boolean;
            loadBalancing?: boolean;
            autoScaling?: boolean;
            caching?: boolean;
            optimization?: boolean;
        };
        security?: {
            encryption?: 'AES-256' | 'ChaCha20' | 'RSA-4096';
            accessControl?: boolean;
            auditLogging?: boolean;
            compliance?: ('GDPR' | 'HIPAA' | 'SOX' | 'PCI-DSS')[];
        };
        monitoring?: {
            enabled?: boolean;
            metrics?: boolean;
            alerting?: boolean;
            healthChecks?: boolean;
            performance?: boolean;
        };
        integration?: {
            webhooks?: string[];
            apis?: string[];
            databases?: string[];
            services?: string[];
        };
    }): Promise<any>;
    /**
     * 🗄️ CONNECT DATABASE (One-Line Setup)
     * Seamlessly connects database using platform-managed credentials
     */
    connectDatabase(providerName: string, options?: {
        databaseName?: string;
        connectionPool?: {
            min?: number;
            max?: number;
            idleTimeout?: number;
            acquireTimeout?: number;
        };
        performance?: {
            caching?: boolean;
            indexOptimization?: boolean;
            queryOptimization?: boolean;
            connectionReuse?: boolean;
        };
        security?: {
            encryption?: 'TLS' | 'SSL' | 'AES-256';
            authentication?: 'basic' | 'certificate' | 'kerberos' | 'oauth';
            accessControl?: boolean;
            auditLogging?: boolean;
        };
        backup?: {
            enabled?: boolean;
            frequency?: 'hourly' | 'daily' | 'weekly';
            retention?: number;
            compression?: boolean;
            incremental?: boolean;
        };
        monitoring?: {
            enabled?: boolean;
            queryPerformance?: boolean;
            connectionHealth?: boolean;
            resourceUsage?: boolean;
            alerting?: boolean;
        };
        replication?: {
            enabled?: boolean;
            type?: 'master-slave' | 'master-master' | 'cluster';
            lag?: number;
            failover?: boolean;
        };
        sharding?: {
            enabled?: boolean;
            strategy?: 'range' | 'hash' | 'directory';
            shardCount?: number;
            rebalancing?: boolean;
        };
        transactions?: {
            isolation?: 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable';
            timeout?: number;
            retryAttempts?: number;
        };
    }): Promise<any>;
    /**
     * 🔐 GET SECRET (Unified Secret Access)
     * Retrieve any secret through secure platform proxy
     */
    getSecret(secretId: string, secretType: any): Promise<string | null>;
    /**
     * 🚀 SETUP COMPLETE APPLICATION (Ultimate One-Line Setup)
     * Complete application setup with all platform-managed services
     */
    setupCompleteApplication(config: {
        aiProviders?: string[];
        cloudProviders?: string[];
        databases?: string[];
        features?: string[];
    }): Promise<any>;
    /**
     * 📋 LIST AVAILABLE SECRETS
     * Get list of secrets configured on the platform for this app
     */
    listAvailableSecrets(): Promise<any[]>;
    /**
     * Shutdown console module
     */
    shutdown(): Promise<void>;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Encrypt payload using Devil framework
     */
    private encryptPayload;
    /**
     * Get enabled capabilities
     */
    private getEnabledCapabilities;
    /**
     * Handle console errors
     */
    private handleError;
    /**
     * Check if console is ready
     */
    isReady(): boolean;
    /**
     * Check if telemetry is active
     */
    isTelemetryActive(): boolean;
    /**
     * Get console configuration
     */
    getConfig(): ConsoleConfig;
    /**
     * Update console configuration
     */
    updateConfig(updates: Partial<ConsoleConfig>): void;
}
/**
 * Get global console instance
 */
declare function getBrolostackConsole(config?: ConsoleConfig): BrolostackConsole;
/**
 * Initialize global console instance
 */
declare function initializeBrolostackConsole(config: ConsoleConfig): Promise<BrolostackConsole>;
/**
 * Console utilities for quick operations
 */
declare const BrolostackConsoleUtils: {
    /**
     * Quick console setup for development
     */
    createDevConfig: (appId: string) => ConsoleConfig;
    /**
     * Quick console setup for production
     */
    createProdConfig: (appId: string, authKey: string) => ConsoleConfig;
    /**
     * Validate configuration
     */
    validateConfig: typeof ConsoleUtils.validateConfig;
    /**
     * Check browser support
     */
    checkSupport: typeof ConsoleUtils.checkBrowserSupport;
};

/**
 * Brolostack Console Module - Event Management
 * Handles real-time event collection and streaming to the console platform
 */

declare class ConsoleEventManager extends EventEmitter {
    private logger;
    private eventQueue;
    private isCollecting;
    private features;
    private appId;
    constructor(appId: string, features?: Record<string, boolean>);
    /**
     * Start collecting events from Brolostack modules
     */
    startEventCollection(): void;
    /**
     * Stop collecting events
     */
    stopEventCollection(): void;
    /**
     * Create a console event
     */
    createEvent(type: ConsoleEventType, data: any, severity?: ConsoleEventSeverity): ConsoleEvent;
    /**
     * Add event to queue
     */
    addEvent(event: ConsoleEvent): void;
    /**
     * Get queued events and clear queue
     */
    getQueuedEvents(): ConsoleEvent[];
    /**
     * Get current queue size
     */
    getQueueSize(): number;
    /**
     * Collect telemetry data from all Brolostack modules
     */
    collectTelemetryData(): Promise<TelemetryData>;
    /**
     * Setup event listeners for Brolostack modules
     */
    private setupEventListeners;
    /**
     * Remove event listeners
     */
    private removeEventListeners;
    /**
     * Collect performance metrics
     */
    private collectPerformanceMetrics;
    /**
     * Collect AI framework metrics
     */
    private collectAIMetrics;
    /**
     * Collect security metrics
     */
    private collectSecurityMetrics;
    /**
     * Collect real-time metrics
     */
    private collectRealtimeMetrics;
    /**
     * Collect cloud metrics
     */
    private collectCloudMetrics;
    /**
     * Get storage usage information
     */
    private getStorageUsage;
    /**
     * Create device fingerprint
     */
    createDeviceFingerprint(): any;
    /**
     * Check if storage type is available
     */
    private isStorageAvailable;
    /**
     * Generate unique device hash
     */
    private generateDeviceHash;
    /**
     * Get event statistics
     */
    getEventStats(): any;
}

/**
 * Brolostack Console - Unified Secrets Manager
 * Internal infrastructure for Beunec's Brolostack Console Platform
 * Handles secure proxy architecture for all sensitive credentials
 */

type SecretType = 'ai_provider' | 'cloud_provider' | 'database_provider' | 'api_key' | 'webhook_secret' | 'encryption_key';
interface SecretResult {
    success: boolean;
    secretValue?: string;
    proxyEndpoint?: string;
    metadata?: any;
    error?: string;
}
declare class SecretsManager extends EventEmitter {
    private logger;
    private worker;
    private consoleAuthKey;
    private appId;
    private platformUrl;
    private secretCache;
    private proxyEndpoints;
    constructor(consoleAuthKey: string, appId: string, platformUrl: string, worker: BrolostackWorker);
    /**
     * 🔑 UNIFIED SECRET RETRIEVAL API
     * Core method for retrieving any type of secret through secure proxy
     */
    getSecret(secretId: string, secretType: SecretType): Promise<SecretResult>;
    /**
     * 🤖 AI PROVIDER CONNECTION API
     * Seamless AI provider connection with automatic key management
     */
    connectAIProvider(providerName: string, options?: {
        model?: string;
        useCase?: 'flagship' | 'performance' | 'cost-effective' | 'coding' | 'embedding';
        reasoning?: {
            framework?: 'react' | 'cot' | 'tot' | 'cotsc' | 'hybrid';
            reactConfig?: any;
            cotConfig?: any;
            totConfig?: any;
            cotscConfig?: any;
        };
        governance?: {
            enabled?: boolean;
            config?: any;
            realTimeMonitoring?: boolean;
            safetyFirst?: boolean;
        };
        tokenUsage?: {
            controlLevel?: 'basic' | 'strict' | 'advanced';
            maxTokensPerRequest?: number;
            dailyLimit?: number;
            monthlyLimit?: number;
            costThreshold?: number;
        };
        memory?: {
            enabled?: boolean;
            contextWindow?: number;
            semanticSearch?: boolean;
            vectorSearch?: boolean;
            persistentMemory?: boolean;
        };
        websocket?: {
            enabled?: boolean;
            realTimeUpdates?: boolean;
            multiAgentSupport?: boolean;
            streamingResponses?: boolean;
        };
        backend?: {
            enabled?: boolean;
            framework?: 'express' | 'nestjs' | 'fastify' | 'fastapi' | 'django' | 'flask' | 'none';
            endpoints?: string[];
        };
        tools?: {
            enabled?: boolean;
            customTools?: string[];
            externalIntegrations?: string[];
        };
        performance?: {
            enabled?: boolean;
            caching?: boolean;
            rateLimiting?: boolean;
            optimization?: boolean;
        };
    }): Promise<any>;
    /**
     * ☁️ CLOUD PROVIDER CONNECTION API
     * Seamless cloud provider connection with automatic credential management
     */
    connectCloudProvider(providerName: string, options?: {
        adapterConfig?: any;
        syncStrategy?: 'local-first' | 'cloud-first' | 'hybrid';
        conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
        backup?: {
            enabled?: boolean;
            frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
            retention?: number;
            compression?: boolean;
            encryption?: boolean;
        };
        sync?: {
            enabled?: boolean;
            realTime?: boolean;
            batchSize?: number;
            retryAttempts?: number;
            conflictDetection?: boolean;
        };
        storage?: {
            caching?: boolean;
            compression?: boolean;
            encryption?: boolean;
            redundancy?: 'single' | 'dual' | 'triple';
            region?: string;
        };
        performance?: {
            connectionPooling?: boolean;
            loadBalancing?: boolean;
            autoScaling?: boolean;
            caching?: boolean;
            optimization?: boolean;
        };
        security?: {
            encryption?: 'AES-256' | 'ChaCha20' | 'RSA-4096';
            accessControl?: boolean;
            auditLogging?: boolean;
            compliance?: ('GDPR' | 'HIPAA' | 'SOX' | 'PCI-DSS')[];
        };
        monitoring?: {
            enabled?: boolean;
            metrics?: boolean;
            alerting?: boolean;
            healthChecks?: boolean;
            performance?: boolean;
        };
        integration?: {
            webhooks?: string[];
            apis?: string[];
            databases?: string[];
            services?: string[];
        };
    }): Promise<any>;
    /**
     * 🗄️ DATABASE PROVIDER CONNECTION API
     * Seamless database connection with automatic credential management
     */
    connectDatabaseProvider(providerName: string, options?: {
        databaseName?: string;
        connectionPool?: {
            min?: number;
            max?: number;
            idleTimeout?: number;
            acquireTimeout?: number;
        };
        performance?: {
            caching?: boolean;
            indexOptimization?: boolean;
            queryOptimization?: boolean;
            connectionReuse?: boolean;
        };
        security?: {
            encryption?: 'TLS' | 'SSL' | 'AES-256';
            authentication?: 'basic' | 'certificate' | 'kerberos' | 'oauth';
            accessControl?: boolean;
            auditLogging?: boolean;
        };
        backup?: {
            enabled?: boolean;
            frequency?: 'hourly' | 'daily' | 'weekly';
            retention?: number;
            compression?: boolean;
            incremental?: boolean;
        };
        monitoring?: {
            enabled?: boolean;
            queryPerformance?: boolean;
            connectionHealth?: boolean;
            resourceUsage?: boolean;
            alerting?: boolean;
        };
        replication?: {
            enabled?: boolean;
            type?: 'master-slave' | 'master-master' | 'cluster';
            lag?: number;
            failover?: boolean;
        };
        sharding?: {
            enabled?: boolean;
            strategy?: 'range' | 'hash' | 'directory';
            shardCount?: number;
            rebalancing?: boolean;
        };
        transactions?: {
            isolation?: 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable';
            timeout?: number;
            retryAttempts?: number;
        };
    }): Promise<any>;
    /**
     * 🔐 SECURE PROXY API CALL
     * Generic method for making secure API calls through console platform proxies
     */
    makeProxyAPICall(secretId: string, endpoint: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any): Promise<any>;
    /**
     * 📋 LIST AVAILABLE SECRETS
     * Get list of secrets configured for this app on the platform
     */
    listAvailableSecrets(): Promise<{
        secretId: string;
        type: SecretType;
        provider: string;
    }[]>;
    /**
     * 🔄 REFRESH SECRET CACHE
     * Force refresh of cached secrets
     */
    refreshSecretCache(secretId?: string): void;
    /**
     * 📊 GET SECRETS USAGE STATS
     * Get statistics about secret usage for platform analytics
     */
    getSecretsStats(): any;
    /**
     * 📊 COLLECT COMPREHENSIVE FRAMEWORK TELEMETRY
     * Gathers data from ALL Brolostack components for platform analytics
     */
    collectFrameworkTelemetry(): Promise<{
        core: any;
        ai: any;
        cloud: any;
        security: any;
        realtime: any;
        storage: any;
        auth: any;
        worker: any;
        mrm: any;
        react: any;
    }>;
    /**
     * Create request signature for security
     */
    private createRequestSignature;
    /**
     * Get available models for AI provider
     */
    getAvailableModels(providerName: string): {
        flagship: string[];
        performance: string[];
        costEffective: string[];
        coding: string[];
        embedding: string[];
        default: string;
    };
    /**
     * Get default model for AI provider
     */
    private getDefaultModel;
    /**
     * Get recommended model based on use case
     */
    getRecommendedModel(providerName: string, useCase?: 'flagship' | 'performance' | 'cost-effective' | 'coding' | 'embedding'): string;
    /**
     * Get configuration presets for different use cases
     */
    getConfigurationPresets(): {
        production: any;
        development: any;
        costOptimized: any;
        performanceOptimized: any;
        fullFeatured: any;
        minimal: any;
    };
    /**
     * Apply configuration preset
     */
    applyPreset(preset: 'production' | 'development' | 'cost-optimized' | 'performance-optimized' | 'full-featured' | 'minimal'): any;
    /**
     * Get cloud provider configuration presets
     */
    getCloudConfigurationPresets(): {
        production: any;
        development: any;
        enterprise: any;
        startupOptimized: any;
        multiRegion: any;
        minimal: any;
    };
    /**
     * Apply cloud configuration preset
     */
    applyCloudPreset(preset: 'production' | 'development' | 'enterprise' | 'startup-optimized' | 'multi-region' | 'minimal'): any;
    /**
     * Get database configuration presets
     */
    getDatabaseConfigurationPresets(): {
        production: any;
        development: any;
        analytics: any;
        transactional: any;
        caching: any;
        minimal: any;
    };
    /**
     * Apply database configuration preset
     */
    applyDatabasePreset(preset: 'production' | 'development' | 'analytics' | 'transactional' | 'caching' | 'minimal'): any;
    /**
     * Create database adapter based on provider
     */
    private createDatabaseAdapter;
}
/**
 * 🏭 CONSOLE PLATFORM INTEGRATION LAYER
 * High-level API for seamless integration with Brolostack modules
 */
declare class ConsolePlatformIntegration {
    private secretsManager;
    private logger;
    constructor(secretsManager: SecretsManager);
    /**
     * 🤖 ONE-LINE AI PROVIDER SETUP
     * Automatically connects AI provider with platform-managed keys
     */
    setupAIProvider(providerName: string, options?: {
        model?: string;
        useCase?: 'flagship' | 'performance' | 'cost-effective' | 'coding' | 'embedding';
        reasoning?: {
            framework?: 'react' | 'cot' | 'tot' | 'cotsc' | 'hybrid';
            reactConfig?: any;
            cotConfig?: any;
            totConfig?: any;
            cotscConfig?: any;
        };
        governance?: {
            enabled?: boolean;
            config?: any;
            realTimeMonitoring?: boolean;
            safetyFirst?: boolean;
        };
        tokenUsage?: {
            controlLevel?: 'basic' | 'strict' | 'advanced';
            maxTokensPerRequest?: number;
            dailyLimit?: number;
            monthlyLimit?: number;
            costThreshold?: number;
        };
        memory?: {
            enabled?: boolean;
            contextWindow?: number;
            semanticSearch?: boolean;
            vectorSearch?: boolean;
            persistentMemory?: boolean;
        };
        websocket?: {
            enabled?: boolean;
            realTimeUpdates?: boolean;
            multiAgentSupport?: boolean;
            streamingResponses?: boolean;
        };
        backend?: {
            enabled?: boolean;
            framework?: 'express' | 'nestjs' | 'fastify' | 'fastapi' | 'django' | 'flask' | 'none';
            endpoints?: string[];
        };
        tools?: {
            enabled?: boolean;
            customTools?: string[];
            externalIntegrations?: string[];
        };
        performance?: {
            enabled?: boolean;
            caching?: boolean;
            rateLimiting?: boolean;
            optimization?: boolean;
        };
    }): Promise<any>;
    /**
     * ☁️ ONE-LINE CLOUD PROVIDER SETUP
     * Automatically connects cloud provider with platform-managed credentials
     */
    setupCloudProvider(providerName: string, options?: any): Promise<any>;
    /**
     * 🗄️ ONE-LINE DATABASE SETUP
     * Automatically connects database with platform-managed credentials
     */
    setupDatabase(providerName: string, options?: any): Promise<any>;
    /**
     * 🚀 COMPLETE APPLICATION SETUP
     * One-line setup for entire Brolostack application with platform integration
     */
    setupCompleteApplication(config: {
        aiProviders?: string[];
        cloudProviders?: string[];
        databases?: string[];
        features?: string[];
    }): Promise<{
        ai?: any[];
        cloud?: any[];
        databases?: any[];
    }>;
}

/**
 * Brolostack Console Module - Framework Integration Verification
 * Ensures console module can access and integrate with ALL Brolostack components
 * This is critical for the console platform to get complete application details
 */
declare class FrameworkIntegrationCheck {
    private logger;
    constructor();
    /**
     * Verify all Brolostack framework components are accessible
     */
    verifyAllIntegrations(): Promise<{
        success: boolean;
        components: Record<string, boolean>;
        missing: string[];
        errors: string[];
    }>;
    private checkCoreFramework;
    private checkAIFramework;
    private checkCloudFramework;
    private checkSecurityFramework;
    private checkRealtimeFramework;
    private checkStorageFramework;
    private checkWorkerFramework;
    private checkAuthFramework;
    private checkMRMFramework;
    private checkReactIntegration;
}
/**
 * Quick integration check for console module
 */
declare function checkConsoleIntegration(): Promise<boolean>;

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

export { AIGovernance, AIMAPIAdapter, AIManager, AIProviderFactory, ARGSProtocolHandler, ARGS_PROTOCOL_NAME, ARGS_VERSION, ApplicationTemplates, AuthManager, AuthenticationError, AutoGenAdapter, BaseAIAdapter, BroadcomAdapter, Brolostack, BrolostackAI, BrolostackAIFramework, BrolostackAIProvider, BrolostackBSDGF4AI, BrolostackCIAMProvider, BrolostackCoT, BrolostackCoTSC, BrolostackConsole, BrolostackConsoleUtils, BrolostackDevil, BrolostackDevilParcelPlugin, BrolostackDevilProvider, BrolostackDevilSourceCode, BrolostackDevilWebpackPlugin, BrolostackMRMManager, BrolostackNodeJSIntegration, BrolostackProvider, BrolostackPythonIntegration, BrolostackReAcT, BrolostackSecurity, BrolostackToT, BrolostackWSClientside, BrolostackWSMultiagent, BrolostackWorker, BrowserCompatibility, BrowserCompatibleStorageAdapter, BrowserCompatibleSyncManager, COMPLIANCE_REQUIREMENTS, CONSOLE_DEFAULTS, CONSOLE_ENDPOINTS, CONSOLE_VERSION, CRUDManager, CiscoCloudAdapter, ClarifaiAdapter, CloudBrolostack, CloudProviderFactory, CloudSyncManager, CloudflareAdapter, CohesityAdapter, ComplianceError, ComplianceOptimizedStrategy, ConsoleCapability, ConsoleConnectionState, ConsoleEncryptionLevel, ConsoleEnvironment, ConsoleErrorCode, ConsoleEventManager, ConsoleEventSeverity, ConsoleFeature, ConsoleHealthStatus, ConsoleOperationType, ConsolePlatformIntegration, ConsoleUtils, CoreWeaveAdapter, CostOptimizedStrategy, CrewAIAdapter, DEFAULT_ARGS_CONFIG, DatabricksAdapter, DellCloudAdapter, Devil, DevilCLI, DevilEncryptionAlgorithm, DevilSecurityLevel, DevilSourceCode, DigitalOceanAdapter, EncryptionError, EnhancedBrolostack, EnhancedStorageAdapter, EnterpriseProviderManager, Environment, EnvironmentManager, _default as EnvironmentUtils, EventEmitter, ExpressAdapter, ExpressWebSocketSetup, FastAPIAdapter, FastifyWebSocketSetup, FlaskAdapter, FrameworkIntegrationCheck, HuaweiCloudAdapter, IBMCloudAdapter, IBMWatsonAdapter, LangChainAdapter, LangGraphAdapter, LocalAPI, LocalStorageAdapter, LogLevel, Logger, MALICIOUS_PATTERNS, MiniMaxAdapter, MongoDBAtlasAdapter, MySQLAdapter, NLPCloudAdapter, NestJSAdapter, NestJSWebSocketSetup, NetAppCloudAdapter, NoSQLAdapter, OracleCloudAdapter, PerformanceOptimizedStrategy, PerplexityAdapter, PostgreSQLAdapter, PrivateModeManager, PrivateModeStorageAdapter, ProtectedRoute, PythonClientIntegration, RackspaceAdapter, RedisCloudAdapter, SAPCloudAdapter, SECURITY_HEADERS, SENSITIVE_DATA_PATTERNS, SQLAdapter, SalesforceCloudAdapter, SecretsManager, SecurityAudit, SecurityAuditor, SecurityError, SecurityManager, SupabaseAdapter, SyncManager, TelemetryInterval, TencentCloudAdapter, TogetherAIAdapter, TokenUsageDisplay, TokenUsageGuard, TokenUsageManager, VMwareCloudAdapter, ValidationError, WebSocketManager, XAIAdapter, brolostackDevilBabelPlugin, brolostackDevilNextPlugin, brolostackDevilRollupPlugin, brolostackDevilVitePlugin, browserCompatibility, checkConsoleIntegration, createReactAppDevil, Brolostack as default, environmentManager, getBrolostackAI, getBrolostackBSDGF4AI, getBrolostackConsole, getBrolostackDevil, getBrolostackDevilSourceCode, getSecurityAuditor, initializeBrolostackConsole, privateModeManager, useAIConversation, useAIGovernance, useAIStreaming, useAuth, useBiometricAuth, useBrolostack, useBrolostackAI, useBrolostackCIAM, useBrolostackDevil, useBrolostackStore, useBrolostackWebSocket, useDevilCloudProtection, useDevilMonitoring, useDevilProtectedAI, useDevilProtectedState, useMFA, usePasswordlessAuth, usePermissions, useProviderManagement, useReasoningFramework, useSocialAuth, useTokenUsage };
export type { AIAgent, AIAgentConfig, AIAgentState, AICapabilities, AIChoice, AIConfig, AICoordinationRule, AICoordinator, AIError, AIExecutionResult, AIGuardrails, AIKeyConfig, AIMemory, AIMemoryEntry, AIMemoryStats, AIMessage, AIMultiAgentState, AIMultiAgentStats, AIMultiAgentSystem, AIPromptAnalysis, AIProvider, AIProviderCapabilities, AIProviderConfig, AIProviderResponse, AIResponse, AIResponseAnalysis, AIResult, AITask, AITaskRequirement, AITool, AIToolCall, AIUsage, AIUsageMetrics, AIWorkflow, AIWorkflowCondition, AIWorkflowStep, APIBatchRequest, APIBatchResponse, APICache, APIClient, APIConfig, APIError, APIGraphQLClient, APIGraphQLRequest, APIGraphQLResponse, APIMetric, APIMiddleware, APIMonitoring, APIMonitoringStats, APIRateLimit, APIRequest, APIResponse, APISocket, APISubscription, AWSConfig, AgentProgressUpdate, AlibabaCloudConfig, AnalyticsEvent, AnthropicConfig, AppRegistrationPayload, AuthConfig, AuthSession, AuthToken, AuthenticationMethod, AuthenticationResult, BSDGFAssessmentResult, BSDGFConfig, BackendIntegration, BrolostackAIConfig, BrolostackAIProviderProps, BrolostackAPI, BrolostackApp, BrolostackCIAMProviderProps, BrolostackConfig, BrolostackContextValue, BrolostackDevilConfig, BrolostackDevilProviderProps, BrolostackDevilSourceCodeConfig, BrolostackError, BrolostackHook, BrolostackMiddleware, BrolostackPlugin, BrolostackProviderProps$1 as BrolostackProviderProps, BrolostackSecurityConfig, BrolostackStore, CIAMProvider, CIAMProviderConfig, ClientMessage, ClientWebSocketRoom, CloudAdapter$1 as CloudAdapter, CloudAdapterCapabilities, CloudAdapterStatus, CloudAuthConfig, CloudAuthProvider, CloudBackup, CloudProviderCapabilities, CloudSyncEvent, CloudflareConfig, CoTConfig, CoTResult, CoTSCConfig, CoTSCResult, CohereConfig, CohesityConfig, CollaborationSession, ComplianceFramework, ComplianceReport, ConnectionStatus, ConsentRecord, ConsoleConfig, ConsoleError, ConsoleEvent, ConsoleEventType, ConsoleMetrics, ConsolePlatformConfig, ConsoleResponse, ConsoleStats, ConsoleStatus, CryptoKey$1 as CryptoKey, DataClassification, DataSubjectRequest, DatabricksConfig, DecryptionRequest, DeepPartial, DeviceFingerprint, DevilBlockchainToken, DevilBuildPluginOptions, DevilEncryptionResult, DevilObfuscationResult, DigitalOceanConfig, EncryptionAlgorithm, EncryptionOptions, EncryptionResult, EnhancedCloudAdapter, EnhancedWebSocketConfig, FileSystemNode, FirebaseConfig, GoogleCloudConfig, GovernedAIResponse, HashAlgorithm, HuaweiCloudConfig, HuggingFaceConfig, HybridAuthConfig, IBMCloudConfig, IBMWatsonConfig, KeyGenerationOptions, LocalAPIEndpoint, LocalAPIRequest, LocalAPIResponse, LocalAPIRouter, LoginCredentials, MistralConfig, MongoDBConfig, MultiProviderConfig, NLPCloudConfig, NetAppConfig, OpenAIConfig, OracleCloudConfig, Permission, PerplexityConfig, PersistConfig, ProjectConfig, ProviderSelectionStrategy, RackspaceConfig, ReActConfig, ReActResult, RealtimeExecutionProcess, RealtimeExecutionStep, RedisConfig, ReplicateConfig, Role, SalesforceCloudConfig, SanitizationOptions, SecureStorageOptions, SecurityEvent, SecurityEventType, SecurityLevel, SecurityUtils, SessionInfo, StabilityAIConfig, StorageAdapter, StorageBackup, StorageCompression, StorageConfig, StorageDriver, StorageEncryption, StorageEvent, StorageEventType, StorageIndex, StorageItem, StorageMigration, StorageOperation, StorageOptions, StorageQuery, StorageSchema, StorageStats, StorageStoreSchema, StorageTransaction, StoreState, StreamChunk, StreamConfig, TelemetryData, TencentCloudConfig, ToTConfig, ToTResult, TogetherAIConfig, TokenControlResult, TokenUsageConfig, TokenUsageMetrics, User, UserSession, VMwareCloudConfig, ValidationResult, ValidationRule, WebSocketConfig, WebSocketEvents, WebSocketMessage, WebSocketRoom };
