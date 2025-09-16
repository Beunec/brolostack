/**
 * Brolostack - Local API Implementation
 * Provides a REST-like API interface for local storage operations
 */

import { BrolostackAPI, APIRequest, APIResponse, LocalAPIEndpoint, LocalAPIRequest, LocalAPIResponse, LocalAPIRouter, APIMiddleware } from '../types';
import { StorageAdapter } from '../types';
// import { EventEmitter } from '../utils/EventEmitter';

export class LocalAPI implements BrolostackAPI {
  private router: LocalAPIRouter;
  private middleware: APIMiddleware[] = [];

  constructor(
    private _storage: StorageAdapter
  ) {
    this.router = new LocalAPIRouterImpl();
    this.setupDefaultEndpoints();
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>('GET', endpoint, undefined, {});
    return response.data as T;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>('POST', endpoint, data, {});
    return response.data as T;
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>('PUT', endpoint, data, {});
    return response.data as T;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>('DELETE', endpoint, undefined, {});
    return response.data as T;
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>('PATCH', endpoint, data, {});
    return response.data as T;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: Partial<APIRequest>
  ): Promise<APIResponse<T>> {
    const request: LocalAPIRequest = {
      method,
      path: endpoint,
      headers: config?.headers || {},
      body: data,
      query: config?.query || {},
      params: {},
      timestamp: Date.now()
    };

    try {
      // Apply middleware
      for (const middleware of this.middleware) {
        if (middleware.request) {
          const modifiedRequest = await middleware.request(request as any);
          Object.assign(request, modifiedRequest);
        }
      }

      // Handle the request
      const response = await this.router.handle(request);

      // Apply response middleware
      let finalResponse = response;
      for (const middleware of this.middleware) {
        if (middleware.response) {
          finalResponse = await middleware.response(finalResponse as any);
        }
      }

      return {
        data: finalResponse.data,
        status: finalResponse.status,
        statusText: finalResponse.statusText,
        headers: finalResponse.headers || {},
        config: request as any,
        request
      };
    } catch (error) {
      // Apply error middleware
      let finalError = error;
      for (const middleware of this.middleware) {
        if (middleware.error) {
          finalError = await middleware.error(finalError as any);
        }
      }

      throw finalError;
    }
  }

  /**
   * Register a new endpoint
   */
  registerEndpoint(endpoint: LocalAPIEndpoint): void {
    this.router.register(endpoint);
  }

  /**
   * Add middleware
   */
  use(middleware: APIMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Setup default endpoints
   */
  private setupDefaultEndpoints(): void {
    // Storage endpoints
    this.router.register({
      path: '/storage/:key',
      method: 'GET',
      handler: async (_request) => {
        const key = _request.params['key'];
        if (!key) {
          return {
            data: null,
            status: 400,
            statusText: 'Bad Request'
          };
        }
        const value = await this._storage.getItem(key);
        return {
          data: value,
          status: 200,
          statusText: 'OK'
        };
      }
    });

    this.router.register({
      path: '/storage/:key',
      method: 'POST',
      handler: async (_request) => {
        const key = _request.params['key'];
        if (!key) {
          return {
            data: null,
            status: 400,
            statusText: 'Bad Request'
          };
        }
        await this._storage.setItem(key, _request.body);
        return {
          data: { success: true, key },
          status: 201,
          statusText: 'Created'
        };
      }
    });

    this.router.register({
      path: '/storage/:key',
      method: 'PUT',
      handler: async (_request) => {
        const key = _request.params['key'];
        if (!key) {
          return {
            data: null,
            status: 400,
            statusText: 'Bad Request'
          };
        }
        await this._storage.setItem(key, _request.body);
        return {
          data: { success: true, key },
          status: 200,
          statusText: 'OK'
        };
      }
    });

    this.router.register({
      path: '/storage/:key',
      method: 'DELETE',
      handler: async (_request) => {
        const key = _request.params['key'];
        if (!key) {
          return {
            data: null,
            status: 400,
            statusText: 'Bad Request'
          };
        }
        await this._storage.removeItem(key);
        return {
          data: { success: true, key },
          status: 200,
          statusText: 'OK'
        };
      }
    });

    // Storage management endpoints
    this.router.register({
      path: '/storage',
      method: 'GET',
      handler: async (_request) => {
        const keys = await this._storage.keys();
        const items: Record<string, any> = {};
        
        for (const key of keys) {
          items[key] = await this._storage.getItem(key);
        }

        return {
          data: items,
          status: 200,
          statusText: 'OK'
        };
      }
    });

    this.router.register({
      path: '/storage/clear',
      method: 'POST',
      handler: async (_request) => {
        await this._storage.clear();
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK'
        };
      }
    });

    this.router.register({
      path: '/storage/stats',
      method: 'GET',
      handler: async (_request) => {
        const stats = {
          totalItems: await this._storage.length(),
          keys: await this._storage.keys()
        };
        return {
          data: stats,
          status: 200,
          statusText: 'OK'
        };
      }
    });

    // Health check endpoint
    this.router.register({
      path: '/health',
      method: 'GET',
      handler: async (_request) => {
        return {
          data: {
            status: 'healthy',
            timestamp: Date.now(),
            storage: {
              available: true,
              totalItems: await this._storage.length()
            }
          },
          status: 200,
          statusText: 'OK'
        };
      }
    });
  }
}

/**
 * Local API Router Implementation
 */
class LocalAPIRouterImpl implements LocalAPIRouter {
  public routes: Map<string, LocalAPIEndpoint> = new Map();
  public middleware: APIMiddleware[] = [];

  constructor() {}

  register(endpoint: LocalAPIEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`;
    this.routes.set(key, endpoint);
  }

  unregister(path: string, method: string): void {
    const key = `${method}:${path}`;
    this.routes.delete(key);
  }

  async handle(request: LocalAPIRequest): Promise<LocalAPIResponse> {
    const key = `${request.method}:${request.path}`;
    const endpoint = this.routes.get(key);

    if (!endpoint) {
      return {
        data: { error: 'Endpoint not found' },
        status: 404,
        statusText: 'Not Found'
      };
    }

    try {
      // Apply endpoint middleware
      for (const middleware of endpoint.middleware || []) {
        if (middleware.request) {
          const modifiedRequest = await middleware.request(request as any);
          Object.assign(request, modifiedRequest);
        }
      }

      // Execute handler
      const response = await endpoint.handler(request);

      // Apply response middleware
      let finalResponse = response;
      for (const middleware of endpoint.middleware || []) {
        if (middleware.response) {
          finalResponse = await middleware.response(finalResponse as any);
        }
      }

      return finalResponse;
    } catch (error) {
      return {
        data: { error: error instanceof Error ? error.message : 'Internal Server Error' },
        status: 500,
        statusText: 'Internal Server Error'
      };
    }
  }

  use(middleware: APIMiddleware): void {
    this.middleware.push(middleware);
  }
}
