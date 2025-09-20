/**
 * Express.js Backend Adapter for Brolostack
 * Provides seamless integration with Express.js backends for full-stack applications
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface ExpressConfig {
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

export interface ExpressRoute {
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

export interface ExpressMiddleware {
  name: string;
  type: 'auth' | 'validation' | 'logging' | 'security' | 'custom';
  config: Record<string, any>;
  implementation?: string;
}

export interface ExpressSession {
  sessionId: string;
  userId?: string;
  data: Record<string, any>;
  createdAt: Date;
  lastAccess: Date;
  expiresAt: Date;
}

export class ExpressAdapter extends EventEmitter {
  private config: ExpressConfig;
  private logger: Logger;
  private connected = false;
  private session: ExpressSession | null = null;
  private socketIO: any = null;
  private routes: Map<string, ExpressRoute> = new Map();
  private middleware: Map<string, ExpressMiddleware> = new Map();

  constructor(config: ExpressConfig) {
    super();
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      endpoints: {
        health: '/health',
        auth: '/auth',
        api: '/api',
        upload: '/upload',
        websocket: '/socket.io'
      },
      middleware: {
        cors: true,
        helmet: true,
        compression: true,
        rateLimit: true,
        morgan: true
      },
      socketIO: {
        enabled: true,
        path: '/socket.io',
        transports: ['websocket', 'polling']
      },
      ...config
    };
    this.logger = new Logger(false, 'ExpressAdapter');
  }

  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}${this.config.endpoints!.health}`);
      
      if (response.ok) {
        this.connected = true;
        this.emit('connected', { adapter: 'express' });
        this.logger.info('Connected to Express.js backend');
        
        // Initialize Socket.IO if enabled
        if (this.config.socketIO?.enabled) {
          await this.initializeSocketIO();
        }
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to connect to Express.js backend:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Disconnect Socket.IO if connected
      if (this.socketIO) {
        this.socketIO.disconnect();
        this.socketIO = null;
      }

      // Clear session if exists
      if (this.session) {
        await this.logout();
      }
    } catch (error) {
      this.logger.warn('Error during disconnect:', error);
    }

    this.connected = false;
    this.emit('disconnected', { adapter: 'express' });
    this.logger.info('Disconnected from Express.js backend');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Authentication Methods
  async login(credentials: {
    username: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}${this.config.endpoints!.auth}/login`, {
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
      
      // Handle different auth types
      if (this.config.authentication?.type === 'jwt') {
        // Store JWT token
        localStorage.setItem('brolostack_jwt', data.token);
      } else if (this.config.authentication?.type === 'session') {
        // Session is handled via cookies
        this.session = {
          sessionId: data.sessionId,
          userId: data.user.id,
          data: data.session,
          createdAt: new Date(data.createdAt),
          lastAccess: new Date(),
          expiresAt: new Date(data.expiresAt)
        };
      }

      this.emit('login-success', data);
      return data;
    } catch (error) {
      this.emit('login-failed', { error });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.config.baseURL}${this.config.endpoints!.auth}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getAuthHeaders()
      });

      // Clear stored authentication
      if (this.config.authentication?.type === 'jwt') {
        localStorage.removeItem('brolostack_jwt');
      }

      this.session = null;
      this.emit('logout');
    } catch (error) {
      this.logger.error('Logout error:', error);
      throw error;
    }
  }

  // API Methods
  async get(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = new URL(`${this.config.baseURL}${this.config.endpoints!.api}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return this.request('GET', url.toString());
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.request('POST', `${this.config.baseURL}${this.config.endpoints!.api}${endpoint}`, data);
  }

  async put(endpoint: string, data?: any): Promise<any> {
    return this.request('PUT', `${this.config.baseURL}${this.config.endpoints!.api}${endpoint}`, data);
  }

  async delete(endpoint: string): Promise<any> {
    return this.request('DELETE', `${this.config.baseURL}${this.config.endpoints!.api}${endpoint}`);
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    return this.request('PATCH', `${this.config.baseURL}${this.config.endpoints!.api}${endpoint}`, data);
  }

  // File Upload/Download
  async uploadFile(
    file: File,
    endpoint = '/files',
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const response = await fetch(`${this.config.baseURL}${this.config.endpoints!.upload}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('file-uploaded', { file, result });
      return result;
    } catch (error) {
      this.emit('file-upload-failed', { file, error });
      throw error;
    }
  }

  async downloadFile(fileId: string, filename?: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.config.baseURL}${this.config.endpoints!.api}/files/${fileId}`, {
        credentials: 'include',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Trigger download if filename provided
      if (filename && typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      this.emit('file-downloaded', { fileId, size: blob.size });
      return blob;
    } catch (error) {
      this.emit('file-download-failed', { fileId, error });
      throw error;
    }
  }

  // Socket.IO Integration
  private async initializeSocketIO(): Promise<void> {
    if (typeof window === 'undefined') {
      return; // Server-side, skip Socket.IO client initialization
    }

    try {
      // Dynamic import for Socket.IO client
      // Socket.io-client is an optional dependency
      // const { io } = await import('socket.io-client');
      
      // Socket.io-client integration would be implemented here
      // this.socketIO = io(this.config.baseURL, {
      //   path: this.config.socketIO!.path,
      //   transports: this.config.socketIO!.transports,
      //   withCredentials: true,
      //   auth: this.getAuthHeaders()
      // });

      this.socketIO.on('connect', () => {
        this.emit('socketio-connected');
        this.logger.info('Socket.IO connected');
      });

      this.socketIO.on('disconnect', () => {
        this.emit('socketio-disconnected');
        this.logger.info('Socket.IO disconnected');
      });

      this.socketIO.on('error', (error: any) => {
        this.emit('socketio-error', error);
        this.logger.error('Socket.IO error:', error);
      });

      // Handle Brolostack-specific events
      this.socketIO.on('brolostack-sync', (data: any) => {
        this.emit('real-time-sync', data);
      });

      this.socketIO.on('brolostack-notification', (data: any) => {
        this.emit('real-time-notification', data);
      });

      this.socketIO.on('brolostack-broadcast', (data: any) => {
        this.emit('real-time-broadcast', data);
      });

    } catch (error) {
      this.logger.error('Failed to initialize Socket.IO:', error);
    }
  }

  // Real-time Methods
  emitToServer(event: string, data: any): void {
    if (this.socketIO) {
      this.socketIO.emit(event, data);
    } else {
      this.logger.warn('Socket.IO not connected, cannot emit event');
    }
  }

  joinRoom(roomName: string): void {
    if (this.socketIO) {
      this.socketIO.emit('join-room', roomName);
      this.emit('room-joined', { room: roomName });
    }
  }

  leaveRoom(roomName: string): void {
    if (this.socketIO) {
      this.socketIO.emit('leave-room', roomName);
      this.emit('room-left', { room: roomName });
    }
  }

  broadcastToRoom(roomName: string, event: string, data: any): void {
    if (this.socketIO) {
      this.socketIO.emit('room-broadcast', { room: roomName, event, data });
    }
  }

  // Database Operations (for Express + ORM integrations)
  async queryDatabase(query: {
    model: string;
    operation: 'find' | 'findOne' | 'create' | 'update' | 'delete' | 'aggregate';
    data?: any;
    filter?: Record<string, any>;
    options?: Record<string, any>;
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/database/query', query);
      
      this.emit('database-query-executed', { query, result: response });
      return response;
    } catch (error) {
      this.emit('database-query-failed', { query, error });
      throw error;
    }
  }

  // Mongoose Integration (MongoDB)
  async mongooseOperation(operation: {
    model: string;
    method: 'find' | 'findById' | 'findOne' | 'create' | 'findByIdAndUpdate' | 'findByIdAndDelete' | 'aggregate';
    params?: any;
    options?: Record<string, any>;
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/mongoose/operation', operation);
      
      this.emit('mongoose-operation-completed', { operation, result: response });
      return response;
    } catch (error) {
      this.emit('mongoose-operation-failed', { operation, error });
      throw error;
    }
  }

  // Sequelize Integration (SQL databases)
  async sequelizeOperation(operation: {
    model: string;
    method: 'findAll' | 'findByPk' | 'findOne' | 'create' | 'update' | 'destroy' | 'bulkCreate';
    data?: any;
    where?: Record<string, any>;
    include?: any[];
    order?: any[];
    limit?: number;
    offset?: number;
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/sequelize/operation', operation);
      
      this.emit('sequelize-operation-completed', { operation, result: response });
      return response;
    } catch (error) {
      this.emit('sequelize-operation-failed', { operation, error });
      throw error;
    }
  }

  // Prisma Integration
  async prismaOperation(operation: {
    model: string;
    method: 'findMany' | 'findUnique' | 'findFirst' | 'create' | 'update' | 'delete' | 'upsert' | 'createMany';
    data?: any;
    where?: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
    orderBy?: Record<string, any>;
    take?: number;
    skip?: number;
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/prisma/operation', operation);
      
      this.emit('prisma-operation-completed', { operation, result: response });
      return response;
    } catch (error) {
      this.emit('prisma-operation-failed', { operation, error });
      throw error;
    }
  }

  // Caching (Redis integration)
  async setCache(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.request('POST', '/cache/set', {
        key,
        value,
        ttl: ttl || 3600 // Default 1 hour
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

  async deleteCache(key: string): Promise<void> {
    try {
      await this.request('DELETE', `/cache/${key}`);
      
      this.emit('cache-deleted', { key });
    } catch (error) {
      this.logger.error('Failed to delete cache:', error);
      throw error;
    }
  }

  // Background Jobs (Bull Queue integration)
  async createJob(jobConfig: {
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
  }): Promise<string> {
    try {
      const response = await this.request('POST', '/jobs/create', jobConfig);
      
      const jobId = response.job_id;
      this.emit('job-created', { jobId, config: jobConfig });
      return jobId;
    } catch (error) {
      this.emit('job-creation-failed', { config: jobConfig, error });
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<{
    id: string;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
    progress: number;
    data: any;
    result?: any;
    error?: string;
    createdAt: Date;
    processedAt?: Date;
    finishedAt?: Date;
  }> {
    try {
      const response = await this.request('GET', `/jobs/${jobId}/status`);
      
      return response;
    } catch (error) {
      this.logger.error('Failed to get job status:', error);
      throw error;
    }
  }

  // Email Integration (Nodemailer)
  async sendEmail(emailConfig: {
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
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/email/send', emailConfig);
      
      this.emit('email-sent', { config: emailConfig, result: response });
      return response;
    } catch (error) {
      this.emit('email-send-failed', { config: emailConfig, error });
      throw error;
    }
  }

  // Payment Integration (Stripe)
  async createPaymentIntent(paymentConfig: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, any>;
    paymentMethodTypes?: string[];
  }): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    try {
      const response = await this.request('POST', '/payments/create-intent', paymentConfig);
      
      this.emit('payment-intent-created', { config: paymentConfig, result: response });
      return response;
    } catch (error) {
      this.emit('payment-intent-failed', { config: paymentConfig, error });
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    try {
      const response = await this.request('POST', `/payments/${paymentIntentId}/confirm`);
      
      this.emit('payment-confirmed', { paymentIntentId, result: response });
      return response;
    } catch (error) {
      this.emit('payment-confirmation-failed', { paymentIntentId, error });
      throw error;
    }
  }

  // Analytics Integration
  async trackEvent(event: {
    name: string;
    properties: Record<string, any>;
    userId?: string;
    sessionId?: string;
    timestamp?: Date;
  }): Promise<void> {
    try {
      await this.request('POST', '/analytics/track', {
        ...event,
        timestamp: event.timestamp || new Date()
      });

      this.emit('event-tracked', event);
    } catch (error) {
      this.logger.error('Failed to track event:', error);
      // Don't throw - analytics shouldn't break the app
    }
  }

  async getAnalytics(query: {
    metric: string;
    timeRange: string;
    filters?: Record<string, any>;
    groupBy?: string[];
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/analytics/query', query);
      
      return response;
    } catch (error) {
      this.logger.error('Failed to get analytics:', error);
      throw error;
    }
  }

  // Private Methods
  private async request(method: string, endpoint: string, data?: any): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    
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
      const token = localStorage.getItem('brolostack_jwt');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else if (this.config.authentication?.type === 'custom' && this.config.authentication.tokenHeader) {
      const token = localStorage.getItem('brolostack_token');
      if (token) {
        headers[this.config.authentication.tokenHeader] = token;
      }
    }

    return headers;
  }

  // Utility Methods
  getSession(): ExpressSession | null {
    return this.session;
  }

  getRoutes(): ExpressRoute[] {
    return Array.from(this.routes.values());
  }

  getMiddleware(): ExpressMiddleware[] {
    return Array.from(this.middleware.values());
  }

  getConfig(): ExpressConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ExpressConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  getStats() {
    return {
      connected: this.connected,
      baseURL: this.config.baseURL,
      sessionActive: !!this.session,
      socketIOConnected: this.socketIO?.connected || false,
      routeCount: this.routes.size,
      middlewareCount: this.middleware.size
    };
  }
}
