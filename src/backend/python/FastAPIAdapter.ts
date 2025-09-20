/**
 * FastAPI Backend Adapter for Brolostack
 * Provides seamless integration with FastAPI backends for full-stack and AI applications
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface FastAPIConfig {
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

export interface FastAPIResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface FastAPIError {
  detail: string;
  status_code: number;
  type?: string;
  context?: Record<string, any>;
}

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' | 'huggingface' 
           | 'stability-ai' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' | 'perplexity' 
           | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' | 'clarifai' | 'together-ai' 
           | 'nlp-cloud' | 'aimlapi' | 'local';
  model: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  systemPrompt?: string;
  endpoint?: string;
  region?: string;
}

export class FastAPIAdapter extends EventEmitter {
  private config: FastAPIConfig;
  private logger: Logger;
  private connected = false;
  private requestId = 0;

  constructor(config: FastAPIConfig) {
    super();
    this.config = {
      apiVersion: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      endpoints: {
        health: '/health',
        auth: '/auth',
        sync: '/api/brolostack/sync',
        websocket: '/ws',
        ai: '/api/ai'
      },
      middleware: {
        cors: true,
        rateLimit: true,
        compression: true
      },
      ...config
    };
    this.logger = new Logger(false, 'FastAPIAdapter');
  }

  async connect(): Promise<void> {
    try {
      const response = await this.request('GET', this.config.endpoints!.health);
      
      if (response.status === 200) {
        this.connected = true;
        this.emit('connected', { adapter: 'fastapi', config: this.config });
        this.logger.info('Connected to FastAPI backend');
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to connect to FastAPI backend:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: 'fastapi' });
    this.logger.info('Disconnected from FastAPI backend');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Authentication Methods
  async login(credentials: { username: string; password: string }): Promise<any> {
    try {
      const response = await this.request('POST', `${this.config.endpoints!.auth}/login`, {
        username: credentials.username,
        password: credentials.password
      });

      if (response.data.access_token) {
        // Update authentication config
        this.config.authentication = {
          type: 'bearer',
          token: response.data.access_token
        };

        this.emit('login-success', response.data);
        return response.data;
      }

      throw new Error('Invalid login response');
    } catch (error) {
      this.emit('login-failed', { error });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('POST', `${this.config.endpoints!.auth}/logout`);
      
      // Clear authentication
      if (this.config.authentication) {
        delete this.config.authentication.token;
      }

      this.emit('logout');
    } catch (error) {
      this.logger.error('Logout error:', error);
      throw error;
    }
  }

  // Data Synchronization Methods
  async syncStore(storeName: string, data: any): Promise<any> {
    try {
      const response = await this.request('POST', `${this.config.endpoints!.sync}/store`, {
        store_name: storeName,
        data,
        timestamp: new Date().toISOString()
      });

      this.emit('store-synced', { storeName, data, response: response.data });
      return response.data;
    } catch (error) {
      this.emit('sync-failed', { storeName, error });
      throw error;
    }
  }

  async restoreStore(storeName: string): Promise<any> {
    try {
      const response = await this.request('GET', `${this.config.endpoints!.sync}/store/${storeName}`);
      
      this.emit('store-restored', { storeName, data: response.data });
      return response.data;
    } catch (error) {
      this.emit('restore-failed', { storeName, error });
      throw error;
    }
  }

  async bulkSync(stores: Record<string, any>): Promise<any> {
    try {
      const response = await this.request('POST', `${this.config.endpoints!.sync}/bulk`, {
        stores,
        timestamp: new Date().toISOString()
      });

      this.emit('bulk-synced', { stores, response: response.data });
      return response.data;
    } catch (error) {
      this.emit('bulk-sync-failed', { stores, error });
      throw error;
    }
  }

  // AI Integration Methods
  async createAIChat(config: AIModelConfig): Promise<string> {
    try {
      const response = await this.request('POST', `${this.config.endpoints!.ai}/chat/create`, {
        provider: config.provider,
        model: config.model,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
        system_prompt: config.systemPrompt
      });

      const chatId = response.data.chat_id;
      this.emit('ai-chat-created', { chatId, config });
      return chatId;
    } catch (error) {
      this.emit('ai-chat-failed', { config, error });
      throw error;
    }
  }

  async sendAIMessage(chatId: string, message: string, streaming = false): Promise<any> {
    try {
      if (streaming) {
        return this.streamAIMessage(chatId, message);
      }

      const response = await this.request('POST', `${this.config.endpoints!.ai}/chat/${chatId}/message`, {
        message,
        timestamp: new Date().toISOString()
      });

      this.emit('ai-message-sent', { chatId, message, response: response.data });
      return response.data;
    } catch (error) {
      this.emit('ai-message-failed', { chatId, message, error });
      throw error;
    }
  }

  async streamAIMessage(chatId: string, message: string): Promise<ReadableStream> {
    try {
      const response = await fetch(`${this.config.baseURL}${this.config.endpoints!.ai}/chat/${chatId}/stream`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      const stream = response.body;
      this.emit('ai-stream-started', { chatId, message });
      return stream!;
    } catch (error) {
      this.emit('ai-stream-failed', { chatId, message, error });
      throw error;
    }
  }

  async getAIChatHistory(chatId: string, limit = 50): Promise<any> {
    try {
      const response = await this.request('GET', `${this.config.endpoints!.ai}/chat/${chatId}/history?limit=${limit}`);
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get chat history for ${chatId}:`, error);
      throw error;
    }
  }

  // Multi-Agent AI Methods
  async createAgentTeam(teamConfig: {
    name: string;
    agents: Array<{
      name: string;
      role: string;
      model: string;
      tools?: string[];
      systemPrompt?: string;
    }>;
    workflow?: 'sequential' | 'parallel' | 'hierarchical';
  }): Promise<string> {
    try {
      const response = await this.request('POST', `${this.config.endpoints!.ai}/agents/team`, teamConfig);
      
      const teamId = response.data.team_id;
      this.emit('agent-team-created', { teamId, config: teamConfig });
      return teamId;
    } catch (error) {
      this.emit('agent-team-failed', { config: teamConfig, error });
      throw error;
    }
  }

  async executeAgentTask(teamId: string, task: {
    description: string;
    context?: any;
    maxIterations?: number;
    timeout?: number;
  }): Promise<any> {
    try {
      const response = await this.request('POST', `${this.config.endpoints!.ai}/agents/team/${teamId}/execute`, task);
      
      this.emit('agent-task-completed', { teamId, task, result: response.data });
      return response.data;
    } catch (error) {
      this.emit('agent-task-failed', { teamId, task, error });
      throw error;
    }
  }

  // Real-time Features
  createWebSocketConnection(): WebSocket {
    const wsUrl = `${this.config.baseURL.replace('http', 'ws')}${this.config.endpoints!.websocket}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      this.emit('websocket-connected');
      this.logger.info('WebSocket connected to FastAPI backend');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('websocket-message', data);
      } catch (error) {
        this.logger.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      this.emit('websocket-disconnected');
      this.logger.info('WebSocket disconnected from FastAPI backend');
    };

    ws.onerror = (error) => {
      this.emit('websocket-error', error);
      this.logger.error('WebSocket error:', error);
    };

    return ws;
  }

  // File Upload/Download
  async uploadFile(file: File, metadata?: Record<string, any>): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch(`${this.config.baseURL}/api/files/upload`, {
        method: 'POST',
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

  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/files/${fileId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      this.emit('file-downloaded', { fileId, size: blob.size });
      return blob;
    } catch (error) {
      this.emit('file-download-failed', { fileId, error });
      throw error;
    }
  }

  // Database Operations
  async executeQuery(query: {
    table: string;
    operation: 'select' | 'insert' | 'update' | 'delete';
    data?: any;
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/api/database/query', query);
      
      this.emit('query-executed', { query, result: response.data });
      return response.data;
    } catch (error) {
      this.emit('query-failed', { query, error });
      throw error;
    }
  }

  // Analytics and Monitoring
  async getAnalytics(timeRange: string = '24h'): Promise<any> {
    try {
      const response = await this.request('GET', `/api/analytics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get analytics:', error);
      throw error;
    }
  }

  async logEvent(event: {
    type: string;
    data: any;
    userId?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      await this.request('POST', '/api/analytics/event', {
        ...event,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to log event:', error);
      // Don't throw - analytics shouldn't break the app
    }
  }

  // Private Methods
  private async request(method: string, endpoint: string, data?: any): Promise<FastAPIResponse> {
    const requestId = ++this.requestId;
    const url = `${this.config.baseURL}${endpoint}`;

    try {
      const response = await this.makeRequest(method, url, data, requestId);
      
      if (!response.ok) {
        const errorData = await response.json() as FastAPIError;
        throw new Error(`${errorData.detail} (${errorData.status_code})`);
      }

      const result = await response.json();
      return {
        data: result,
        status: response.status,
        timestamp: new Date().toISOString(),
        requestId: requestId.toString()
      };
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  private async makeRequest(method: string, url: string, data?: any, requestId?: number, attempt = 1): Promise<Response> {
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Log request
      this.logger.debug(`${method} ${url} - ${response.status}`, {
        requestId,
        attempt,
        data: method !== 'GET' ? data : undefined
      });

      return response;
    } catch (error) {
      if (attempt < this.config.retryAttempts!) {
        this.logger.warn(`Request failed, retrying (${attempt}/${this.config.retryAttempts})`, error);
        await this.delay(this.config.retryDelay! * attempt);
        return this.makeRequest(method, url, data, requestId, attempt + 1);
      }
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

    // Add authentication headers
    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'bearer':
          if (this.config.authentication.token) {
            headers['Authorization'] = `Bearer ${this.config.authentication.token}`;
          }
          break;
        case 'basic':
          if (this.config.authentication.username && this.config.authentication.password) {
            const credentials = btoa(`${this.config.authentication.username}:${this.config.authentication.password}`);
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'api-key':
          if (this.config.authentication.apiKey) {
            headers['X-API-Key'] = this.config.authentication.apiKey;
          }
          break;
      }
    }

    return headers;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.authentication?.type === 'bearer' && this.config.authentication.token) {
      headers['Authorization'] = `Bearer ${this.config.authentication.token}`;
    }

    return headers;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility Methods
  getConfig(): FastAPIConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<FastAPIConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  getStats() {
    return {
      connected: this.connected,
      baseURL: this.config.baseURL,
      requestCount: this.requestId,
      lastActivity: new Date().toISOString()
    };
  }
}
