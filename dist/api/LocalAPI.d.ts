/**
 * Brolostack - Local API Implementation
 * Provides a REST-like API interface for local storage operations
 */
import { BrolostackAPI, LocalAPIEndpoint, APIMiddleware } from '../types';
import { StorageAdapter } from '../types';
export declare class LocalAPI implements BrolostackAPI {
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
//# sourceMappingURL=LocalAPI.d.ts.map