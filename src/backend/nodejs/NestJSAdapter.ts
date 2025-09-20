/**
 * NestJS Backend Adapter for Brolostack
 * Provides seamless integration with NestJS backends for enterprise applications
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface NestJSConfig {
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

export interface NestJSModule {
  name: string;
  type: 'feature' | 'shared' | 'core' | 'common';
  providers: string[];
  controllers: string[];
  imports?: string[];
  exports?: string[];
}

export interface NestJSService {
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

export interface NestJSController {
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

export interface NestJSGuard {
  name: string;
  type: 'auth' | 'role' | 'permission' | 'throttle' | 'custom';
  config: Record<string, any>;
  implementation?: string;
}

export interface NestJSInterceptor {
  name: string;
  type: 'logging' | 'transform' | 'cache' | 'timeout' | 'custom';
  config: Record<string, any>;
  implementation?: string;
}

export interface NestJSPipe {
  name: string;
  type: 'validation' | 'transform' | 'parse' | 'custom';
  config: Record<string, any>;
  implementation?: string;
}

export class NestJSAdapter extends EventEmitter {
  private config: NestJSConfig;
  private logger: Logger;
  private connected = false;
  private modules: Map<string, NestJSModule> = new Map();
  private services: Map<string, NestJSService> = new Map();
  private controllers: Map<string, NestJSController> = new Map();
  private guards: Map<string, NestJSGuard> = new Map();
  private interceptors: Map<string, NestJSInterceptor> = new Map();
  private pipes: Map<string, NestJSPipe> = new Map();
  private websocketGateway: any = null;

  constructor(config: NestJSConfig) {
    super();
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      swagger: {
        enabled: true,
        path: 'api/docs',
        version: '1.0.2'
      },
      websocket: {
        enabled: true,
        gateway: 'BrolostackGateway'
      },
      ...config
    };
    this.logger = new Logger(false, 'NestJSAdapter');
  }

  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`);
      
      if (response.ok) {
        this.connected = true;
        this.emit('connected', { adapter: 'nestjs' });
        this.logger.info('Connected to NestJS backend');
        
        // Initialize WebSocket gateway if enabled
        if (this.config.websocket?.enabled) {
          await this.initializeWebSocketGateway();
        }
        
        // Load application metadata
        await this.loadApplicationMetadata();
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to connect to NestJS backend:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.websocketGateway) {
        this.websocketGateway.disconnect();
        this.websocketGateway = null;
      }
    } catch (error) {
      this.logger.warn('Error during WebSocket disconnect:', error);
    }

    this.connected = false;
    this.emit('disconnected', { adapter: 'nestjs' });
    this.logger.info('Disconnected from NestJS backend');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Authentication Methods (Passport.js integration)
  async login(credentials: {
    username: string;
    password: string;
    strategy?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store JWT if using JWT strategy
      if (this.config.authentication?.type === 'jwt' && data.access_token) {
        localStorage.setItem('nestjs_jwt', data.access_token);
      }

      this.emit('login-success', data);
      return data;
    } catch (error) {
      this.emit('login-failed', { error });
      throw error;
    }
  }

  async oauthLogin(provider: 'google' | 'github' | 'facebook' | 'twitter'): Promise<void> {
    try {
      // Redirect to OAuth provider
      window.location.href = `${this.config.baseURL}/auth/${provider}`;
    } catch (error) {
      this.emit('oauth-login-failed', { provider, error });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.config.baseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getAuthHeaders()
      });

      // Clear stored tokens
      localStorage.removeItem('nestjs_jwt');
      
      this.emit('logout');
    } catch (error) {
      this.logger.error('Logout error:', error);
      throw error;
    }
  }

  // Service Integration
  async callService(serviceName: string, method: string, params?: any[]): Promise<any> {
    try {
      const response = await this.request('POST', '/services/call', {
        service: serviceName,
        method,
        params: params || []
      });

      this.emit('service-called', { serviceName, method, params, result: response });
      return response;
    } catch (error) {
      this.emit('service-call-failed', { serviceName, method, params, error });
      throw error;
    }
  }

  // GraphQL Integration
  async graphqlQuery(query: string, variables?: Record<string, any>): Promise<any> {
    if (!this.config.graphql?.enabled) {
      throw new Error('GraphQL is not enabled');
    }

    try {
      const response = await fetch(`${this.config.baseURL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL query failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      this.emit('graphql-query-executed', { query, variables, result });
      return result.data;
    } catch (error) {
      this.emit('graphql-query-failed', { query, variables, error });
      throw error;
    }
  }

  async graphqlSubscription(
    subscription: string,
    variables?: Record<string, any>,
    onData?: (data: any) => void
  ): Promise<() => void> {
    if (!this.config.graphql?.enabled || !this.config.graphql.subscriptions) {
      throw new Error('GraphQL subscriptions are not enabled');
    }

    try {
      // This would typically use a WebSocket connection for subscriptions
      const ws = new WebSocket(`${this.config.baseURL.replace('http', 'ws')}/graphql`, 'graphql-ws');
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'connection_init'
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'data' && onData) {
          onData(message.payload);
        }
      };

      // Send subscription
      ws.send(JSON.stringify({
        type: 'start',
        payload: {
          query: subscription,
          variables
        }
      }));

      this.emit('graphql-subscription-started', { subscription, variables });

      // Return unsubscribe function
      return () => {
        ws.send(JSON.stringify({ type: 'stop' }));
        ws.close();
      };
    } catch (error) {
      this.emit('graphql-subscription-failed', { subscription, variables, error });
      throw error;
    }
  }

  // Microservices Integration
  async sendMicroserviceMessage(service: string, pattern: string, data: any): Promise<any> {
    if (!this.config.microservices?.enabled) {
      throw new Error('Microservices are not enabled');
    }

    try {
      const response = await this.request('POST', '/microservices/send', {
        service,
        pattern,
        data
      });

      this.emit('microservice-message-sent', { service, pattern, data, result: response });
      return response;
    } catch (error) {
      this.emit('microservice-message-failed', { service, pattern, data, error });
      throw error;
    }
  }

  // WebSocket Gateway Integration
  private async initializeWebSocketGateway(): Promise<void> {
    if (typeof window === 'undefined') {
      return; // Server-side, skip WebSocket client initialization
    }

    try {
      // Dynamic import for Socket.IO client
      // Socket.io-client is an optional dependency
      // const { io } = await import('socket.io-client');
      
      // Socket.io-client integration would be implemented here
      // const namespace = this.config.websocket?.namespace || '/';
      // this.websocketGateway = io(`${this.config.baseURL}${namespace}`, {
      //   withCredentials: true,
      //   auth: this.getAuthHeaders()
      // });

      this.websocketGateway.on('connect', () => {
        this.emit('websocket-gateway-connected');
        this.logger.info('WebSocket gateway connected');
      });

      this.websocketGateway.on('disconnect', () => {
        this.emit('websocket-gateway-disconnected');
        this.logger.info('WebSocket gateway disconnected');
      });

      this.websocketGateway.on('error', (error: any) => {
        this.emit('websocket-gateway-error', error);
        this.logger.error('WebSocket gateway error:', error);
      });

      // Handle NestJS-specific events
      this.websocketGateway.on('brolostack-sync', (data: any) => {
        this.emit('real-time-sync', data);
      });

      this.websocketGateway.on('brolostack-notification', (data: any) => {
        this.emit('real-time-notification', data);
      });

    } catch (error) {
      this.logger.error('Failed to initialize WebSocket gateway:', error);
    }
  }

  // Validation and Pipes
  async validateData(data: any, validationSchema: string): Promise<{
    valid: boolean;
    errors?: Array<{
      property: string;
      constraints: Record<string, string>;
      value: any;
    }>;
  }> {
    try {
      const response = await this.request('POST', '/validation/validate', {
        data,
        schema: validationSchema
      });

      return response;
    } catch (error) {
      this.logger.error('Data validation failed:', error);
      throw error;
    }
  }

  async transformData(data: any, transformationPipe: string): Promise<any> {
    try {
      const response = await this.request('POST', '/transformation/transform', {
        data,
        pipe: transformationPipe
      });

      this.emit('data-transformed', { originalData: data, transformedData: response });
      return response;
    } catch (error) {
      this.emit('data-transformation-failed', { data, pipe: transformationPipe, error });
      throw error;
    }
  }

  // Caching (NestJS Cache Manager)
  async setCache(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.request('POST', '/cache/set', {
        key,
        value,
        ttl: ttl || 300 // Default 5 minutes
      });

      this.emit('cache-set', { key, value, ttl });
    } catch (error) {
      this.logger.error('Failed to set cache:', error);
      throw error;
    }
  }

  async getCache(key: string): Promise<any> {
    try {
      const response = await this.request('GET', `/cache/${key}`);
      
      this.emit('cache-retrieved', { key, value: response });
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null; // Cache miss
      }
      this.logger.error('Failed to get cache:', error);
      throw error;
    }
  }

  // Queue Integration (Bull)
  async addToQueue(queueName: string, jobData: {
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
  }): Promise<string> {
    try {
      const response = await this.request('POST', `/queues/${queueName}/add`, jobData);
      
      const jobId = response.job_id;
      this.emit('job-added-to-queue', { queueName, jobData, jobId });
      return jobId;
    } catch (error) {
      this.emit('job-queue-failed', { queueName, jobData, error });
      throw error;
    }
  }

  async getQueueStatus(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    try {
      const response = await this.request('GET', `/queues/${queueName}/status`);
      
      return response;
    } catch (error) {
      this.logger.error('Failed to get queue status:', error);
      throw error;
    }
  }

  // Event Emitter Integration
  async emitEvent(eventName: string, payload: any): Promise<void> {
    try {
      await this.request('POST', '/events/emit', {
        event: eventName,
        payload,
        timestamp: new Date().toISOString()
      });

      this.emit('backend-event-emitted', { eventName, payload });
    } catch (error) {
      this.logger.error('Failed to emit backend event:', error);
      throw error;
    }
  }

  async subscribeToEvent(eventName: string, callback: (payload: any) => void): Promise<() => void> {
    if (!this.websocketGateway) {
      throw new Error('WebSocket gateway is not connected');
    }

    this.websocketGateway.on(eventName, callback);
    this.emit('event-subscribed', { eventName });

    // Return unsubscribe function
    return () => {
      this.websocketGateway.off(eventName, callback);
      this.emit('event-unsubscribed', { eventName });
    };
  }

  // Configuration Management
  async getConfiguration(configKey?: string): Promise<any> {
    try {
      const endpoint = configKey ? `/config/${configKey}` : '/config';
      const response = await this.request('GET', endpoint);
      
      return response;
    } catch (error) {
      this.logger.error('Failed to get configuration:', error);
      throw error;
    }
  }

  async updateConfiguration(configKey: string, value: any): Promise<void> {
    try {
      await this.request('PUT', `/config/${configKey}`, { value });
      
      this.emit('configuration-updated', { configKey, value });
    } catch (error) {
      this.logger.error('Failed to update configuration:', error);
      throw error;
    }
  }

  // Health Monitoring
  async getHealthCheck(): Promise<{
    status: 'ok' | 'error' | 'shutting_down';
    info: Record<string, any>;
    error: Record<string, any>;
    details: Record<string, any>;
  }> {
    try {
      const response = await this.request('GET', '/health');
      
      return response;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw error;
    }
  }

  async getMetrics(): Promise<{
    uptime: number;
    memory: Record<string, number>;
    cpu: Record<string, number>;
    requests: Record<string, number>;
    database: Record<string, any>;
    cache: Record<string, any>;
  }> {
    try {
      const response = await this.request('GET', '/metrics');
      
      return response;
    } catch (error) {
      this.logger.error('Failed to get metrics:', error);
      throw error;
    }
  }

  // Swagger/OpenAPI Integration
  async getOpenAPISpec(): Promise<any> {
    if (!this.config.swagger?.enabled) {
      throw new Error('Swagger is not enabled');
    }

    try {
      const response = await fetch(`${this.config.baseURL}/${this.config.swagger.path}/json`);
      
      if (!response.ok) {
        throw new Error(`Failed to get OpenAPI spec: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get OpenAPI specification:', error);
      throw error;
    }
  }

  // Database Integration (TypeORM)
  async typeormQuery(query: {
    entity: string;
    operation: 'find' | 'findOne' | 'save' | 'update' | 'delete' | 'query';
    data?: any;
    where?: Record<string, any>;
    relations?: string[];
    order?: Record<string, 'ASC' | 'DESC'>;
    take?: number;
    skip?: number;
    sql?: string; // For raw queries
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/database/typeorm', query);
      
      this.emit('typeorm-query-executed', { query, result: response });
      return response;
    } catch (error) {
      this.emit('typeorm-query-failed', { query, error });
      throw error;
    }
  }

  // Testing Integration
  async runTests(testConfig: {
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
  }> {
    try {
      const response = await this.request('POST', '/testing/run', testConfig);
      
      this.emit('tests-executed', { config: testConfig, result: response });
      return response;
    } catch (error) {
      this.emit('tests-failed', { config: testConfig, error });
      throw error;
    }
  }

  // Private Methods
  private async loadApplicationMetadata(): Promise<void> {
    try {
      const response = await this.request('GET', '/metadata');
      
      const metadata = response;
      
      // Load modules
      if (metadata.modules) {
        metadata.modules.forEach((module: NestJSModule) => {
          this.modules.set(module.name, module);
        });
      }

      // Load services
      if (metadata.services) {
        metadata.services.forEach((service: NestJSService) => {
          this.services.set(service.name, service);
        });
      }

      // Load controllers
      if (metadata.controllers) {
        metadata.controllers.forEach((controller: NestJSController) => {
          this.controllers.set(controller.name, controller);
        });
      }

      this.emit('metadata-loaded', metadata);
    } catch (error) {
      this.logger.error('Failed to load application metadata:', error);
    }
  }

  private async request(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      credentials: 'include',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client': 'Brolostack',
      'X-Client-Version': '1.0.2'
    };

    return { ...headers, ...this.getAuthHeaders() };
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.authentication?.type === 'jwt') {
      const token = localStorage.getItem('nestjs_jwt');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Utility Methods
  getModules(): NestJSModule[] {
    return Array.from(this.modules.values());
  }

  getServices(): NestJSService[] {
    return Array.from(this.services.values());
  }

  getControllers(): NestJSController[] {
    return Array.from(this.controllers.values());
  }

  getGuards(): NestJSGuard[] {
    return Array.from(this.guards.values());
  }

  getInterceptors(): NestJSInterceptor[] {
    return Array.from(this.interceptors.values());
  }

  getPipes(): NestJSPipe[] {
    return Array.from(this.pipes.values());
  }

  getConfig(): NestJSConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<NestJSConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  getStats() {
    return {
      connected: this.connected,
      baseURL: this.config.baseURL,
      moduleCount: this.modules.size,
      serviceCount: this.services.size,
      controllerCount: this.controllers.size,
      websocketConnected: this.websocketGateway?.connected || false,
      swaggerEnabled: this.config.swagger?.enabled || false,
      graphqlEnabled: this.config.graphql?.enabled || false,
      microservicesEnabled: this.config.microservices?.enabled || false
    };
  }
}
