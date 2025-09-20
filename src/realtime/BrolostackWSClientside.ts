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

// Dynamic import for Socket.IO client (optional dependency)
type Socket = any;
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { Environment, environmentManager } from '../core/EnvironmentManager';

export interface BrolostackWSClientsideConfig {
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

export interface WSMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  room?: string | undefined;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface WSConnectionStats {
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

export interface WSRoom {
  id: string;
  name: string;
  memberCount: number;
  joinedAt: number;
  lastActivity: number;
  messageCount: number;
}

export class BrolostackWSClientside extends EventEmitter {
  private socket: Socket | null = null;
  private logger: Logger;
  private config: BrolostackWSClientsideConfig;
  private messageQueue: WSMessage[] = [];
  private rooms: Map<string, WSRoom> = new Map();
  private stats: WSConnectionStats;
  private latencyMeasurements: number[] = [];
  private heartbeatTimer?: NodeJS.Timeout | undefined;
  
  constructor(config: Partial<BrolostackWSClientsideConfig> = {}) {
    super();
    
    // Apply environment-specific configuration
    this.config = this.createEnvironmentConfig(config);
    this.logger = new Logger(Environment.isDev(), 'BrolostackWSClientside');
    
    // Initialize stats
    this.stats = {
      connected: false,
      environment: Environment.current(),
      reconnectCount: 0,
      messagesSent: 0,
      messagesReceived: 0,
      averageLatency: 0,
      lastActivity: Date.now(),
      rooms: []
    };
    
    this.logger.info('BrolostackWSClientside initialized', {
      environment: Environment.current(),
      config: this.config
    });
    
    // Load persisted queue if enabled
    this.loadPersistedQueue();
    
    // Auto-connect if enabled
    if (this.config.autoConnect) {
      this.connect();
    }
  }
  
  /**
   * Create environment-specific configuration
   */
  private createEnvironmentConfig(userConfig: Partial<BrolostackWSClientsideConfig>): BrolostackWSClientsideConfig {
    const envConfig = environmentManager.getConfig();
    
    // Base configuration
    const baseConfig: BrolostackWSClientsideConfig = {
      url: this.getDefaultURL(),
      path: '/brolostack-ws',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Environment.isProd() ? 10 : 5,
      reconnectionDelay: Environment.isProd() ? 1000 : 2000,
      reconnectionDelayMax: Environment.isProd() ? 5000 : 10000,
      timeout: envConfig.api.requestTimeout,
      forceNew: false,
      compression: envConfig.performance.enableCompression,
      enableHeartbeat: true,
      heartbeatInterval: 30000,
      messageQueue: {
        enabled: Environment.isProd() || Environment.isStaging(),
        maxSize: Environment.isProd() ? 1000 : 100,
        persistOffline: Environment.isProd()
      },
      performance: {
        enableMetrics: envConfig.monitoring.enablePerformanceMonitoring,
        sampleRate: Environment.isProd() ? 0.1 : 1.0
      }
    };
    
    return { ...baseConfig, ...userConfig };
  }
  
  /**
   * Get default WebSocket URL based on environment
   */
  private getDefaultURL(): string {
    if (Environment.isDev()) {
      return 'http://localhost:3001';
    } else if (Environment.isStaging()) {
      return process.env['STAGING_WS_URL'] || 'wss://staging-ws.yourdomain.com';
    } else if (Environment.isProd()) {
      return process.env['PRODUCTION_WS_URL'] || 'wss://ws.yourdomain.com';
    } else {
      return 'http://localhost:3001';
    }
  }
  
  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const socketConfig: any = {
          path: this.config.path,
          autoConnect: false,
          reconnection: this.config.reconnection,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
          reconnectionDelayMax: this.config.reconnectionDelayMax,
          timeout: this.config.timeout,
          forceNew: this.config.forceNew,
          transports: ['websocket', 'polling']
        };
        
        // Add authentication if provided
        if (this.config.auth) {
          socketConfig.auth = this.config.auth;
        }
        
        // Environment-specific configurations
        if (Environment.isProd()) {
          socketConfig.upgrade = true;
          socketConfig.rememberUpgrade = true;
        }
        
        // Dynamic import for Socket.IO client
        const { io } = await import('socket.io-client');
        this.socket = io(this.config.url!, socketConfig);
        
        this.setupEventHandlers();
        
        this.socket.connect();
        
        // Resolve when connected
        this.socket.on('connect', () => {
          this.stats.connected = true;
          this.stats.connectionTime = Date.now();
          this.stats.lastActivity = Date.now();
          
          this.logger.info('WebSocket connected', {
            url: this.config.url,
            environment: Environment.current(),
            socketId: this.socket?.id
          });
          
          this.startHeartbeat();
          this.processMessageQueue();
          
          resolve();
        });
        
        this.socket.on('connect_error', (error: any) => {
          this.logger.error('WebSocket connection error:', error);
          reject(error);
        });
        
      } catch (error) {
        this.logger.error('Failed to initialize WebSocket connection:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    // Connection events
    this.socket.on('connect', () => {
      this.handleConnect();
    });
    
    this.socket.on('disconnect', (reason: any) => {
      this.handleDisconnect(reason);
    });
    
    this.socket.on('reconnect', (attemptNumber: any) => {
      this.handleReconnect(attemptNumber);
    });
    
    this.socket.on('reconnect_error', (error: any) => {
      this.handleReconnectError(error);
    });
    
    // Custom events
    this.socket.on('message', (data: any) => {
      this.handleMessage(data);
    });
    
    this.socket.on('room-joined', (data: any) => {
      this.handleRoomJoined(data);
    });
    
    this.socket.on('room-left', (data: any) => {
      this.handleRoomLeft(data);
    });
    
    this.socket.on('user-joined', (data: any) => {
      this.handleUserJoined(data);
    });
    
    this.socket.on('user-left', (data: any) => {
      this.handleUserLeft(data);
    });
    
    // Performance monitoring
    if (this.config.performance?.enableMetrics) {
      this.socket.on('pong', (latency: any) => {
        this.updateLatencyMetrics(latency);
      });
    }
  }
  
  /**
   * Connection event handlers
   */
  private handleConnect(): void {
    this.stats.connected = true;
    this.stats.connectionTime = Date.now();
    this.stats.lastActivity = Date.now();
    
    this.emit('connected', {
      socketId: this.socket?.id,
      environment: Environment.current(),
      timestamp: Date.now()
    });
  }
  
  private handleDisconnect(reason: string): void {
    this.stats.connected = false;
    this.stopHeartbeat();
    
    this.emit('disconnected', {
      reason,
      environment: Environment.current(),
      timestamp: Date.now()
    });
    
    this.logger.info('WebSocket disconnected', { reason });
  }
  
  private handleReconnect(attemptNumber: number): void {
    this.stats.reconnectCount++;
    this.stats.connectionTime = Date.now();
    
    this.emit('reconnected', {
      attemptNumber,
      environment: Environment.current(),
      timestamp: Date.now()
    });
    
    this.logger.info('WebSocket reconnected', { attemptNumber });
    this.processMessageQueue();
  }
  
  private handleReconnectError(error: Error): void {
    this.emit('reconnect-error', {
      error: error.message,
      environment: Environment.current(),
      timestamp: Date.now()
    });
    
    this.logger.error('WebSocket reconnection failed:', error);
  }
  
  /**
   * Message handling
   */
  private handleMessage(data: any): void {
    this.stats.messagesReceived++;
    this.stats.lastActivity = Date.now();
    
    // Emit to application
    this.emit('message', data);
    
    // Log in development
    if (Environment.isDev()) {
      this.logger.info('Message received', data);
    }
  }
  
  /**
   * Room management handlers
   */
  private handleRoomJoined(data: { roomId: string; roomName: string; memberCount: number }): void {
    const room: WSRoom = {
      id: data.roomId,
      name: data.roomName,
      memberCount: data.memberCount,
      joinedAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0
    };
    
    this.rooms.set(data.roomId, room);
    this.stats.rooms = Array.from(this.rooms.keys());
    
    this.emit('room-joined', data);
    this.logger.info('Joined room', data);
  }
  
  private handleRoomLeft(data: { roomId: string }): void {
    this.rooms.delete(data.roomId);
    this.stats.rooms = Array.from(this.rooms.keys());
    
    this.emit('room-left', data);
    this.logger.info('Left room', data);
  }
  
  private handleUserJoined(data: { roomId: string; userId: string; userInfo?: any }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.memberCount++;
      room.lastActivity = Date.now();
    }
    
    this.emit('user-joined', data);
  }
  
  private handleUserLeft(data: { roomId: string; userId: string }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.memberCount = Math.max(0, room.memberCount - 1);
      room.lastActivity = Date.now();
    }
    
    this.emit('user-left', data);
  }
  
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
  }): void {
    const message: WSMessage = {
      id: this.generateMessageId(),
      type: event,
      payload: data,
      timestamp: Date.now(),
      room: options?.room,
      priority: options?.priority || 'medium'
    };
    
    if (!this.socket?.connected) {
      if (this.config.messageQueue?.enabled) {
        this.queueMessage(message);
        return;
      } else {
        throw new Error('WebSocket not connected and message queuing is disabled');
      }
    }
    
    this.socket.emit(event, data);
    this.stats.messagesSent++;
    this.stats.lastActivity = Date.now();
    
    // Update room message count
    if (options?.room) {
      const room = this.rooms.get(options.room);
      if (room) {
        room.messageCount++;
        room.lastActivity = Date.now();
      }
    }
    
    // Log in development
    if (Environment.isDev()) {
      this.logger.info('Message sent', { event, data, options });
    }
    
    this.emit('message-sent', { event, data, options, timestamp: Date.now() });
  }
  
  /**
   * Join a room
   */
  joinRoom(roomId: string, roomName?: string, userInfo?: any): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    
    this.socket.emit('join-room', {
      roomId,
      roomName: roomName || roomId,
      userInfo,
      timestamp: Date.now()
    });
    
    this.logger.info('Joining room', { roomId, roomName });
  }
  
  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    
    this.socket.emit('leave-room', {
      roomId,
      timestamp: Date.now()
    });
    
    this.logger.info('Leaving room', { roomId });
  }
  
  /**
   * Send message to specific room
   */
  sendToRoom(roomId: string, event: string, data: any): void {
    this.send(event, data, { room: roomId });
  }
  
  /**
   * Broadcast message to all rooms
   */
  broadcast(event: string, data: any): void {
    for (const roomId of this.rooms.keys()) {
      this.sendToRoom(roomId, event, data);
    }
  }
  
  /**
   * Subscribe to specific event
   */
  override on(event: string, handler: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, (data: any) => {
        this.stats.messagesReceived++;
        this.stats.lastActivity = Date.now();
        handler(data);
      });
    }
    
    // Also register with internal event emitter
    super.on(event, handler);
  }
  
  /**
   * Unsubscribe from event
   */
  override off(event: string, handler?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, handler);
    }
    
    if (handler) {
      super.off(event, handler);
    }
  }
  
  /**
   * Message queuing for offline support
   */
  private queueMessage(message: WSMessage): void {
    if (this.messageQueue.length >= (this.config.messageQueue?.maxSize || 100)) {
      // Remove oldest message if queue is full
      this.messageQueue.shift();
    }
    
    this.messageQueue.push(message);
    
    // Persist to localStorage if enabled
    if (this.config.messageQueue?.persistOffline && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('brolostack-ws-queue', JSON.stringify(this.messageQueue));
      } catch (error) {
        this.logger.warn('Failed to persist message queue:', error);
      }
    }
    
    this.emit('message-queued', { message, queueSize: this.messageQueue.length });
  }
  
  /**
   * Process queued messages when connection is restored
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;
    
    this.logger.info('Processing message queue', { queueSize: this.messageQueue.length });
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    // Clear persisted queue
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('brolostack-ws-queue');
    }
    
    // Send queued messages
    for (const message of messages) {
      try {
        this.socket?.emit(message.type, message.payload);
        this.stats.messagesSent++;
      } catch (error) {
        this.logger.error('Failed to send queued message:', error);
        // Re-queue failed message
        this.queueMessage(message);
      }
    }
    
    this.emit('queue-processed', { processedCount: messages.length });
  }
  
  /**
   * Load persisted message queue
   */
  private loadPersistedQueue(): void {
    if (!this.config.messageQueue?.persistOffline || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const queueData = localStorage.getItem('brolostack-ws-queue');
      if (queueData) {
        this.messageQueue = JSON.parse(queueData);
        this.logger.info('Loaded persisted message queue', { queueSize: this.messageQueue.length });
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted message queue:', error);
    }
  }
  
  /**
   * Heartbeat management
   */
  private startHeartbeat(): void {
    if (!this.config.enableHeartbeat || this.heartbeatTimer) return;
    
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        const startTime = Date.now();
        this.socket.emit('ping', startTime);
        
        // Measure latency
        this.socket.once('pong', (timestamp: number) => {
          const latency = Date.now() - timestamp;
          this.updateLatencyMetrics(latency);
        });
      }
    }, this.config.heartbeatInterval);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }
  
  /**
   * Performance monitoring
   */
  private updateLatencyMetrics(latency: number): void {
    this.latencyMeasurements.push(latency);
    
    // Keep only last 100 measurements
    if (this.latencyMeasurements.length > 100) {
      this.latencyMeasurements.shift();
    }
    
    // Calculate average latency
    this.stats.averageLatency = this.latencyMeasurements.reduce((sum, l) => sum + l, 0) / this.latencyMeasurements.length;
    
    this.emit('latency-updated', { latency, average: this.stats.averageLatency });
  }
  
  /**
   * Utility methods
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  /**
   * Get current rooms
   */
  getRooms(): WSRoom[] {
    return Array.from(this.rooms.values());
  }
  
  /**
   * Get connection statistics
   */
  getStats(): WSConnectionStats {
    return {
      ...this.stats,
      rooms: Array.from(this.rooms.keys())
    };
  }
  
  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
  
  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.stopHeartbeat();
      this.socket.disconnect();
      this.stats.connected = false;
      
      this.logger.info('WebSocket disconnected manually');
      this.emit('manual-disconnect', { timestamp: Date.now() });
    }
  }
  
  /**
   * Reconnect to server
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
      this.logger.info('WebSocket reconnection requested');
    }
  }
  
  /**
   * Environment-specific optimizations
   */
  
  /**
   * Enable development mode features
   */
  enableDevMode(): void {
    if (!Environment.isDev()) {
      this.logger.warn('Dev mode features requested in non-development environment');
      return;
    }
    
    // Enable verbose logging
    this.socket?.onAny((event: any, ...args: any[]) => {
      this.logger.info(`Socket event: ${event}`, args);
    });
    
    // Enable performance monitoring
    this.config.performance = {
      enableMetrics: true,
      sampleRate: 1.0
    };
  }
  
  /**
   * Enable production mode optimizations
   */
  enableProdMode(): void {
    if (!Environment.isProd()) {
      this.logger.warn('Production mode optimizations requested in non-production environment');
      return;
    }
    
    // Disable verbose logging
    this.socket?.offAny();
    
    // Enable aggressive message queuing
    this.config.messageQueue = {
      enabled: true,
      maxSize: 1000,
      persistOffline: true
    };
    
    // Optimize reconnection settings
    this.config.reconnectionAttempts = 10;
    this.config.reconnectionDelay = 1000;
  }
  
  /**
   * Cleanup and destroy
   */
  destroy(): void {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
    
    this.rooms.clear();
    this.messageQueue = [];
    
    // Clear persisted queue
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('brolostack-ws-queue');
    }
    
    this.removeAllListeners();
    
    this.logger.info('BrolostackWSClientside destroyed');
  }
}

// React Hook for WebSocket integration
export function useBrolostackWebSocket(config?: Partial<BrolostackWSClientsideConfig>) {
  const [ws, setWs] = React.useState<BrolostackWSClientside | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [stats, setStats] = React.useState<WSConnectionStats | null>(null);
  
  React.useEffect(() => {
    const websocket = new BrolostackWSClientside(config);
    
    websocket.on('connected', () => setConnected(true));
    websocket.on('disconnected', () => setConnected(false));
    websocket.on('reconnected', () => setConnected(true));
    
    // Update stats periodically
    const statsInterval = setInterval(() => {
      setStats(websocket.getStats());
    }, 1000);
    
    setWs(websocket);
    
    return () => {
      clearInterval(statsInterval);
      websocket.destroy();
    };
  }, []);
  
  return {
    ws,
    connected,
    stats,
    joinRoom: (roomId: string, roomName?: string, userInfo?: any) => ws?.joinRoom(roomId, roomName, userInfo),
    leaveRoom: (roomId: string) => ws?.leaveRoom(roomId),
    send: (event: string, data: any, options?: any) => ws?.send(event, data, options),
    sendToRoom: (roomId: string, event: string, data: any) => ws?.sendToRoom(roomId, event, data),
    broadcast: (event: string, data: any) => ws?.broadcast(event, data),
    on: (event: string, handler: (data: any) => void) => ws?.on(event, handler),
    off: (event: string, handler?: (data: any) => void) => ws?.off(event, handler)
  };
}

// TypeScript declaration for React
declare global {
  namespace React {
    function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  }
}
