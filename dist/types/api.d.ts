/**
 * Brolostack - API Type Definitions
 */
export interface APIRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
    timeout?: number;
    retries?: number;
}
export interface APIResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: APIRequest;
    request?: any;
}
export interface APIError {
    message: string;
    code: string;
    status?: number;
    response?: APIResponse;
    request?: APIRequest;
    timestamp: number;
}
export interface APIClient {
    get<T>(endpoint: string, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    post<T>(endpoint: string, data?: any, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    put<T>(endpoint: string, data?: any, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    delete<T>(endpoint: string, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
    patch<T>(endpoint: string, data?: any, config?: Partial<APIRequest>): Promise<APIResponse<T>>;
}
export interface APIMiddleware {
    name: string;
    request?: (config: APIRequest) => APIRequest | Promise<APIRequest>;
    response?: (response: APIResponse) => APIResponse | Promise<APIResponse>;
    error?: (error: APIError) => APIError | Promise<APIError>;
}
export interface APIConfig {
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
export interface LocalAPIEndpoint {
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
export interface LocalAPIRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: any;
    query: Record<string, string>;
    params: Record<string, string>;
    timestamp: number;
}
export interface LocalAPIResponse {
    data?: any;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    error?: APIError;
}
export interface LocalAPIRouter {
    routes: Map<string, LocalAPIEndpoint>;
    middleware: APIMiddleware[];
    register(endpoint: LocalAPIEndpoint): void;
    unregister(path: string, method: string): void;
    handle(request: LocalAPIRequest): Promise<LocalAPIResponse>;
    use(middleware: APIMiddleware): void;
}
export interface APICache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    keys(): Promise<string[]>;
}
export interface APIRateLimit {
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
export interface APIMonitoring {
    requests: APIMetric[];
    errors: APIMetric[];
    responseTimes: APIMetric[];
    recordRequest(request: APIRequest, response: APIResponse, duration: number): void;
    recordError(error: APIError, duration: number): void;
    getStats(): APIMonitoringStats;
    clear(): void;
}
export interface APIMetric {
    timestamp: number;
    value: number;
    metadata?: Record<string, any>;
}
export interface APIMonitoringStats {
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
export interface APIBatchRequest {
    id: string;
    requests: APIRequest[];
    options?: {
        concurrency?: number;
        stopOnError?: boolean;
        retryOnError?: boolean;
    };
}
export interface APIBatchResponse {
    id: string;
    responses: Array<{
        request: APIRequest;
        response?: APIResponse;
        error?: APIError;
    }>;
    success: boolean;
    totalTime: number;
}
export interface APISocket {
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
export interface APISubscription {
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
export interface APIGraphQLRequest {
    query: string;
    variables?: Record<string, any>;
    operationName?: string;
}
export interface APIGraphQLResponse {
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
export interface APIGraphQLClient {
    query(request: APIGraphQLRequest): Promise<APIGraphQLResponse>;
    mutate(request: APIGraphQLRequest): Promise<APIGraphQLResponse>;
    subscribe(request: APIGraphQLRequest): APISubscription;
}
//# sourceMappingURL=api.d.ts.map