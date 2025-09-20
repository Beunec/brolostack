/**
 * Flask Backend Adapter for Brolostack
 * Provides seamless integration with Flask backends for rapid prototyping and microservices
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface FlaskConfig {
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

export interface FlaskSession {
  sessionId: string;
  csrfToken?: string;
  user?: any;
  expires?: Date;
}

export class FlaskAdapter extends EventEmitter {
  private config: FlaskConfig;
  private logger: Logger;
  private connected = false;
  private session: FlaskSession | null = null;
  private requestId = 0;

  constructor(config: FlaskConfig) {
    super();
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      endpoints: {
        health: '/health',
        auth: '/auth',
        sync: '/api/brolostack',
        api: '/api'
      },
      csrf: {
        enabled: true,
        tokenName: 'csrf_token',
        headerName: 'X-CSRFToken'
      },
      ...config
    };
    this.logger = new Logger(false, 'FlaskAdapter');
  }

  async connect(): Promise<void> {
    try {
      // Initialize session
      await this.initializeSession();
      
      const response = await this.request('GET', this.config.endpoints!.health);
      
      if (response.ok) {
        this.connected = true;
        this.emit('connected', { adapter: 'flask' });
        this.logger.info('Connected to Flask backend');
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to connect to Flask backend:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.session) {
        await this.request('POST', `${this.config.endpoints!.auth}/logout`);
      }
    } catch (error) {
      this.logger.warn('Logout request failed during disconnect:', error);
    }

    this.connected = false;
    this.session = null;
    this.emit('disconnected', { adapter: 'flask' });
    this.logger.info('Disconnected from Flask backend');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Session Management
  private async initializeSession(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/session/init`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.session = {
          sessionId: data.session_id,
          csrfToken: data.csrf_token
        };

        this.emit('session-initialized', this.session);
      }
    } catch (error) {
      this.logger.error('Failed to initialize session:', error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials: { username: string; password: string }): Promise<any> {
    try {
      const loginData: any = { ...credentials };
      
      // Add CSRF token if enabled
      if (this.config.csrf?.enabled && this.session?.csrfToken) {
        loginData[this.config.csrf.tokenName!] = this.session.csrfToken;
      }

      const response = await this.request('POST', `${this.config.endpoints!.auth}/login`, loginData);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update session with user info
        if (this.session) {
          this.session.user = data.user;
        }

        this.emit('login-success', data);
        return data;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
    } catch (error) {
      this.emit('login-failed', { error });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const logoutData: any = {};
      
      // Add CSRF token if enabled
      if (this.config.csrf?.enabled && this.session?.csrfToken) {
        logoutData[this.config.csrf.tokenName!] = this.session.csrfToken;
      }

      await this.request('POST', `${this.config.endpoints!.auth}/logout`, logoutData);
      
      // Clear session
      this.session = null;
      this.emit('logout');
    } catch (error) {
      this.logger.error('Logout error:', error);
      throw error;
    }
  }

  // Data Synchronization Methods
  async syncStore(storeName: string, data: any): Promise<any> {
    try {
      const syncData: any = {
        store_name: storeName,
        data,
        timestamp: new Date().toISOString()
      };

      // Add CSRF token if enabled
      if (this.config.csrf?.enabled && this.session?.csrfToken) {
        syncData[this.config.csrf.tokenName!] = this.session.csrfToken;
      }

      const response = await this.request('POST', `${this.config.endpoints!.sync}/sync`, syncData);
      
      if (response.ok) {
        const result = await response.json();
        this.emit('store-synced', { storeName, data, result });
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Sync failed');
      }
    } catch (error) {
      this.emit('sync-failed', { storeName, error });
      throw error;
    }
  }

  async restoreStore(storeName: string): Promise<any> {
    try {
      const response = await this.request('GET', `${this.config.endpoints!.sync}/restore/${storeName}`);
      
      if (response.ok) {
        const data = await response.json();
        this.emit('store-restored', { storeName, data });
        return data;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Restore failed');
      }
    } catch (error) {
      this.emit('restore-failed', { storeName, error });
      throw error;
    }
  }

  // Flask-specific Methods
  async renderTemplate(templateName: string, context: Record<string, any> = {}): Promise<string> {
    try {
      const response = await this.request('POST', '/api/render', {
        template: templateName,
        context,
        csrf_token: this.session?.csrfToken
      });

      if (response.ok) {
        const data = await response.json();
        return data.html;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Template rendering failed');
      }
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw error;
    }
  }

  async callFlaskFunction(functionName: string, args: any[] = [], kwargs: Record<string, any> = {}): Promise<any> {
    try {
      const response = await this.request('POST', '/api/call', {
        function: functionName,
        args,
        kwargs,
        csrf_token: this.session?.csrfToken
      });

      if (response.ok) {
        const data = await response.json();
        return data.result;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Function call failed');
      }
    } catch (error) {
      this.logger.error(`Failed to call function ${functionName}:`, error);
      throw error;
    }
  }

  // Form Handling
  async submitForm(formData: FormData, endpoint: string): Promise<any> {
    try {
      // Add CSRF token to form data if enabled
      if (this.config.csrf?.enabled && this.session?.csrfToken) {
        formData.append(this.config.csrf.tokenName!, this.session.csrfToken);
      }

      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        this.emit('form-submitted', { endpoint, data });
        return data;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Form submission failed');
      }
    } catch (error) {
      this.emit('form-submission-failed', { endpoint, error });
      throw error;
    }
  }

  // File Upload with Flask-WTF
  async uploadFile(file: File, endpoint: string = '/api/upload', metadata?: Record<string, any>): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      // Add CSRF token
      if (this.config.csrf?.enabled && this.session?.csrfToken) {
        formData.append(this.config.csrf.tokenName!, this.session.csrfToken);
      }

      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        this.emit('file-uploaded', { file, result });
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
    } catch (error) {
      this.emit('file-upload-failed', { file, error });
      throw error;
    }
  }

  // Database Operations (with Flask-SQLAlchemy)
  async queryDatabase(query: {
    model: string;
    operation: 'get' | 'filter' | 'create' | 'update' | 'delete';
    data?: any;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    try {
      const requestData = {
        ...query,
        csrf_token: this.session?.csrfToken
      };

      const response = await this.request('POST', '/api/database/query', requestData);
      
      if (response.ok) {
        const result = await response.json();
        this.emit('database-query-executed', { query, result });
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Database query failed');
      }
    } catch (error) {
      this.emit('database-query-failed', { query, error });
      throw error;
    }
  }

  // Flask-Mail Integration
  async sendEmail(emailData: {
    to: string | string[];
    subject: string;
    body: string;
    html?: string;
    attachments?: Array<{ filename: string; data: string }>;
  }): Promise<any> {
    try {
      const response = await this.request('POST', '/api/mail/send', {
        ...emailData,
        csrf_token: this.session?.csrfToken
      });

      if (response.ok) {
        const result = await response.json();
        this.emit('email-sent', { emailData, result });
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Email sending failed');
      }
    } catch (error) {
      this.emit('email-send-failed', { emailData, error });
      throw error;
    }
  }

  // Flask-Caching Integration
  async getCachedData(key: string): Promise<any> {
    try {
      const response = await this.request('GET', `/api/cache/${key}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.value;
      } else if (response.status === 404) {
        return null; // Cache miss
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Cache retrieval failed');
      }
    } catch (error) {
      this.logger.error(`Failed to get cached data for key ${key}:`, error);
      throw error;
    }
  }

  async setCachedData(key: string, value: any, timeout?: number): Promise<void> {
    try {
      const response = await this.request('POST', '/api/cache', {
        key,
        value,
        timeout,
        csrf_token: this.session?.csrfToken
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Cache setting failed');
      }
    } catch (error) {
      this.logger.error(`Failed to set cached data for key ${key}:`, error);
      throw error;
    }
  }

  // Flask-SocketIO Integration
  createSocketIOConnection(): any {
    // This would integrate with Socket.IO client
    // For now, return a placeholder that can be extended
    const socketConfig = {
      url: this.config.baseURL,
      options: {
        transports: ['websocket', 'polling'],
        withCredentials: true
      }
    };

    this.emit('socketio-config-ready', socketConfig);
    return socketConfig;
  }

  // Private Methods
  private async request(method: string, endpoint: string, data?: any): Promise<Response> {
    const requestId = ++this.requestId;
    const url = `${this.config.baseURL}${endpoint}`;

    const options: RequestInit = {
      method,
      credentials: 'include', // Important for Flask sessions
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Update CSRF token if provided in response
      const newCsrfToken = response.headers.get('X-CSRFToken');
      if (newCsrfToken && this.session) {
        this.session.csrfToken = newCsrfToken;
      }

      this.logger.debug(`${method} ${url} - ${response.status}`, { requestId });
      return response;
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

    // Add CSRF token to headers if enabled
    if (this.config.csrf?.enabled && this.session?.csrfToken) {
      headers[this.config.csrf.headerName!] = this.session.csrfToken;
    }

    // Add authentication headers
    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'basic':
          if (this.config.authentication.username && this.config.authentication.password) {
            const credentials = btoa(`${this.config.authentication.username}:${this.config.authentication.password}`);
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'jwt':
          // JWT would typically be handled via cookies in Flask
          break;
        // Session auth is handled via cookies automatically
      }
    }

    return headers;
  }

  // Utility Methods
  getSession(): FlaskSession | null {
    return this.session;
  }

  getConfig(): FlaskConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<FlaskConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  getStats() {
    return {
      connected: this.connected,
      baseURL: this.config.baseURL,
      requestCount: this.requestId,
      sessionActive: !!this.session,
      csrfEnabled: this.config.csrf?.enabled || false
    };
  }
}
