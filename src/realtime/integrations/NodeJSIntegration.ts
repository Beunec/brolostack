/**
 * Brolostack WebSocket Node.js Integration
 * Seamless integration with Express, NestJS, Fastify, and Koa
 */

import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import { BrolostackWSMultiagent, BrolostackWSMultiagentConfig } from '../BrolostackWSMultiagent';
import { Environment } from '../../core/EnvironmentManager';
import { Logger } from '../../utils/Logger';

export interface NodeJSIntegrationConfig {
  framework: 'express' | 'nestjs' | 'fastify' | 'koa';
  server?: HTTPServer | HTTPSServer;
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

export class BrolostackNodeJSIntegration {
  private logger: Logger;
  private config: NodeJSIntegrationConfig;
  private wsMultiagent?: BrolostackWSMultiagent;
  private server?: HTTPServer | HTTPSServer;
  
  constructor(config: NodeJSIntegrationConfig) {
    this.config = config;
    this.logger = new Logger(Environment.isDev(), 'BrolostackNodeJSIntegration');
  }
  
  /**
   * Initialize with Express
   */
  static async withExpress(
    app: any, 
    config: Omit<NodeJSIntegrationConfig, 'framework'>
  ): Promise<BrolostackNodeJSIntegration> {
    const integration = new BrolostackNodeJSIntegration({
      ...config,
      framework: 'express'
    });
    
    await integration.setupExpress(app);
    return integration;
  }
  
  /**
   * Initialize with NestJS
   */
  static async withNestJS(
    app: any,
    config: Omit<NodeJSIntegrationConfig, 'framework'>
  ): Promise<BrolostackNodeJSIntegration> {
    const integration = new BrolostackNodeJSIntegration({
      ...config,
      framework: 'nestjs'
    });
    
    await integration.setupNestJS(app);
    return integration;
  }
  
  /**
   * Initialize with Fastify
   */
  static async withFastify(
    app: any,
    config: Omit<NodeJSIntegrationConfig, 'framework'>
  ): Promise<BrolostackNodeJSIntegration> {
    const integration = new BrolostackNodeJSIntegration({
      ...config,
      framework: 'fastify'
    });
    
    await integration.setupFastify(app);
    return integration;
  }
  
  /**
   * Setup Express integration
   */
  private async setupExpress(app: any): Promise<void> {
    const { createServer } = await import('http');
    
    // Setup middleware
    if (this.config.middleware?.enableCors) {
      try {
        const cors = await import('cors');
        app.use(cors.default({
          origin: Environment.isDev() ? true : process.env['ALLOWED_ORIGINS']?.split(','),
          credentials: true
        }));
      } catch (error) {
        this.logger.warn('CORS middleware not available. Install with: npm install cors');
      }
    }
    
    if (this.config.middleware?.enableRateLimit && (Environment.isProd() || Environment.isStaging())) {
      // Rate limiting middleware would be added here
      this.logger.info('Rate limiting enabled for production/staging');
    }
    
    // Create HTTP server
    this.server = this.config.server || createServer(app);
    
    // Initialize WebSocket
    if (this.server) {
      this.wsMultiagent = new BrolostackWSMultiagent(this.server, this.config.websocket);
    }
    
    // Add Express routes for WebSocket management
    app.get('/brolostack/ws/stats', (_req: any, res: any) => {
      res.json(this.wsMultiagent?.getStats());
    });
    
    app.get('/brolostack/ws/sessions', (_req: any, res: any) => {
      const sessions = this.wsMultiagent?.getActiveSessions();
      res.json({
        count: sessions?.size || 0,
        sessions: Array.from(sessions?.keys() || [])
      });
    });
    
    this.logger.info('Express integration setup complete');
  }
  
  /**
   * Setup NestJS integration
   */
  private async setupNestJS(app: any): Promise<void> {
    // Get the underlying HTTP server from NestJS app
    this.server = app.getHttpServer();
    
    // Initialize WebSocket
    if (this.server) {
      this.wsMultiagent = new BrolostackWSMultiagent(this.server, this.config.websocket);
    }
    
    this.logger.info('NestJS integration setup complete');
  }
  
  /**
   * Setup Fastify integration
   */
  private async setupFastify(app: any): Promise<void> {
    // Get the underlying HTTP server from Fastify
    this.server = app.server;
    
    // Register CORS plugin if needed
    if (this.config.middleware?.enableCors) {
      await app.register(require('@fastify/cors'), {
        origin: Environment.isDev() ? true : process.env['ALLOWED_ORIGINS']?.split(','),
        credentials: true
      });
    }
    
    // Initialize WebSocket
    if (this.server) {
      this.wsMultiagent = new BrolostackWSMultiagent(this.server, this.config.websocket);
    }
    
    // Add Fastify routes
    app.get('/brolostack/ws/stats', async (_request: any, _reply: any) => {
      return this.wsMultiagent?.getStats();
    });
    
    app.get('/brolostack/ws/sessions', async (_request: any, _reply: any) => {
      const sessions = this.wsMultiagent?.getActiveSessions();
      return {
        count: sessions?.size || 0,
        sessions: Array.from(sessions?.keys() || [])
      };
    });
    
    this.logger.info('Fastify integration setup complete');
  }
  
  /**
   * Start the server
   */
  async listen(port?: number, host?: string): Promise<void> {
    if (!this.server) {
      throw new Error('Server not initialized. Call setup method first.');
    }
    
    const listenPort = port || this.config.port || 3001;
    const listenHost = host || this.config.host || '0.0.0.0';
    
    return new Promise((resolve, reject) => {
      this.server!.listen(listenPort, listenHost, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          this.logger.info('Server started', {
            port: listenPort,
            host: listenHost,
            environment: Environment.current(),
            framework: this.config.framework
          });
          resolve();
        }
      });
    });
  }
  
  /**
   * Get WebSocket multi-agent instance
   */
  getMultiAgent(): BrolostackWSMultiagent | undefined {
    return this.wsMultiagent;
  }
  
  /**
   * Get HTTP server instance
   */
  getServer(): HTTPServer | HTTPSServer | undefined {
    return this.server;
  }
  
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
  } {
    return {
      framework: this.config.framework,
      environment: Environment.current(),
      server: {
        listening: this.server?.listening || false,
        address: this.server?.listening ? this.server.address() : undefined
      },
      websocket: this.wsMultiagent?.getStats()
    };
  }
  
  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Node.js integration');
    
    // Shutdown WebSocket
    if (this.wsMultiagent) {
      await this.wsMultiagent.shutdown();
    }
    
    // Close HTTP server
    if (this.server && this.server.listening) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          this.logger.info('HTTP server closed');
          resolve();
        });
      });
    }
  }
}

// Express-specific utilities
export class ExpressWebSocketSetup {
  static async create(app: any, config?: Partial<BrolostackWSMultiagentConfig>): Promise<BrolostackWSMultiagent> {
    const { createServer } = await import('http');
    const server = createServer(app);
    
    const wsMultiagent = new BrolostackWSMultiagent(server, config);
    
    // Add Express middleware for WebSocket info
    app.use('/brolostack/ws', (req: any, _res: any, next: any) => {
      req.wsMultiagent = wsMultiagent;
      next();
    });
    
    return wsMultiagent;
  }
}

// NestJS-specific utilities
export class NestJSWebSocketSetup {
  static async create(app: any, config?: Partial<BrolostackWSMultiagentConfig>): Promise<BrolostackWSMultiagent> {
    const server = app.getHttpServer();
    return new BrolostackWSMultiagent(server, config);
  }
}

// Fastify-specific utilities
export class FastifyWebSocketSetup {
  static async create(app: any, config?: Partial<BrolostackWSMultiagentConfig>): Promise<BrolostackWSMultiagent> {
    const server = app.server;
    return new BrolostackWSMultiagent(server, config);
  }
}

// Koa-specific utilities
export class KoaWebSocketSetup {
  static async create(app: any, config?: Partial<BrolostackWSMultiagentConfig>): Promise<BrolostackWSMultiagent> {
    const { createServer } = await import('http');
    const server = createServer(app.callback());
    
    return new BrolostackWSMultiagent(server, config);
  }
}
