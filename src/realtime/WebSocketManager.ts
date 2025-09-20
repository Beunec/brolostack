/**
 * WebSocket Manager for Real-time Communication
 * Provides enterprise-grade WebSocket functionality for Brolostack
 */

import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { Environment } from '../core/EnvironmentManager';
import { BrolostackWSClientside, BrolostackWSClientsideConfig } from './BrolostackWSClientside';

export interface WebSocketConfig {
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

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  source?: string;
  target?: string;
}

export interface WebSocketChannel {
  name: string;
  subscribers: Set<string>;
  messageHistory: WebSocketMessage[];
  maxHistory?: number;
}

export class WebSocketManager extends EventEmitter {
  private config: WebSocketConfig;
  private socket: WebSocket | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private channels: Map<string, WebSocketChannel> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private logger: Logger;
  private messageId = 0;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      compression: true,
      binaryType: 'arraybuffer',
      ...config
    };
    this.logger = new Logger(Environment.isDev(), 'WebSocketManager');
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Add authentication headers if configured
        const headers: Record<string, string> = {};
        if (this.config.authentication) {
          switch (this.config.authentication.type) {
            case 'bearer':
              headers['Authorization'] = `Bearer ${this.config.authentication.token}`;
              break;
            case 'basic':
              const credentials = btoa(`${this.config.authentication.username}:${this.config.authentication.password}`);
              headers['Authorization'] = `Basic ${credentials}`;
              break;
            case 'custom':
              Object.assign(headers, this.config.authentication.customHeaders);
              break;
          }
        }

        // Create WebSocket connection
        this.socket = new WebSocket(this.config.url, this.config.protocols);
        
        if (this.config.binaryType) {
          this.socket.binaryType = this.config.binaryType;
        }

        this.socket.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.logger.info('WebSocket connected');
          
          // Start heartbeat
          if (this.config.heartbeatInterval && this.config.heartbeatInterval > 0) {
            this.startHeartbeat();
          }

          // Process queued messages
          this.processMessageQueue();

          this.emit('connected');
          resolve();
        };

        this.socket.onclose = (event) => {
          this.connected = false;
          this.stopHeartbeat();
          this.logger.info(`WebSocket disconnected: ${event.code} - ${event.reason}`);
          
          this.emit('disconnected', { code: event.code, reason: event.reason });

          // Attempt reconnection if enabled
          if (this.config.reconnect && this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (error) => {
          this.logger.error('WebSocket error:', error);
          this.emit('error', error);
          if (!this.connected) {
            reject(error);
          }
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

      } catch (error) {
        this.logger.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.connected = false;
    this.emit('disconnected', { code: 1000, reason: 'Client disconnect' });
  }

  isConnected(): boolean {
    return this.connected && this.socket?.readyState === WebSocket.OPEN;
  }

  // Channel Management
  createChannel(name: string, maxHistory = 100): WebSocketChannel {
    if (this.channels.has(name)) {
      throw new Error(`Channel ${name} already exists`);
    }

    const channel: WebSocketChannel = {
      name,
      subscribers: new Set(),
      messageHistory: [],
      maxHistory
    };

    this.channels.set(name, channel);
    this.emit('channel-created', { channel: name });
    return channel;
  }

  joinChannel(channelName: string, subscriberId: string): boolean {
    const channel = this.channels.get(channelName);
    if (!channel) {
      return false;
    }

    channel.subscribers.add(subscriberId);
    this.emit('channel-joined', { channel: channelName, subscriber: subscriberId });
    return true;
  }

  leaveChannel(channelName: string, subscriberId: string): boolean {
    const channel = this.channels.get(channelName);
    if (!channel) {
      return false;
    }

    channel.subscribers.delete(subscriberId);
    this.emit('channel-left', { channel: channelName, subscriber: subscriberId });
    return true;
  }

  deleteChannel(channelName: string): boolean {
    const deleted = this.channels.delete(channelName);
    if (deleted) {
      this.emit('channel-deleted', { channel: channelName });
    }
    return deleted;
  }

  getChannel(channelName: string): WebSocketChannel | undefined {
    return this.channels.get(channelName);
  }

  getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  // Message Operations
  send(message: Partial<WebSocketMessage>): boolean {
    const fullMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      type: message.type || 'message',
      payload: message.payload,
      timestamp: Date.now(),
      source: message.source || 'client',
      target: message.target || 'server'
    };

    if (!this.isConnected()) {
      // Queue message for later sending
      this.messageQueue.push(fullMessage);
      this.logger.warn('WebSocket not connected, message queued');
      return false;
    }

    try {
      this.socket!.send(JSON.stringify(fullMessage));
      this.emit('message-sent', fullMessage);
      return true;
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      this.emit('send-error', { message: fullMessage, error });
      return false;
    }
  }

  sendToChannel(channelName: string, message: Partial<WebSocketMessage>): boolean {
    const channel = this.channels.get(channelName);
    if (!channel) {
      this.logger.warn(`Channel ${channelName} not found`);
      return false;
    }

    const fullMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      type: message.type || 'channel-message',
      payload: message.payload,
      timestamp: Date.now(),
      source: message.source || 'client',
      target: channelName
    };

    // Add to channel history
    channel.messageHistory.push(fullMessage);
    if (channel.maxHistory && channel.messageHistory.length > channel.maxHistory) {
      channel.messageHistory.shift();
    }

    // Send to all channel subscribers
    return this.send(fullMessage);
  }

  broadcast(message: Partial<WebSocketMessage>): boolean {
    const fullMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      type: message.type || 'broadcast',
      payload: message.payload,
      timestamp: Date.now(),
      source: message.source || 'client',
      target: 'broadcast'
    };

    return this.send(fullMessage);
  }

  // Real-time Data Streaming
  startDataStream(streamName: string, dataSource: () => Promise<any>, interval = 1000): void {
    setInterval(async () => {
      try {
        const data = await dataSource();
        this.send({
          type: 'data-stream',
          payload: { stream: streamName, data },
          source: 'data-stream'
        });
      } catch (error) {
        this.logger.error(`Data stream ${streamName} error:`, error);
        this.emit('stream-error', { stream: streamName, error });
      }
    }, interval);

    // Store timer reference for cleanup
    this.emit('stream-started', { stream: streamName, interval });
  }

  // File/Binary Data Transfer
  sendBinary(data: ArrayBuffer | Blob, metadata?: any): boolean {
    if (!this.isConnected()) {
      return false;
    }

    try {
      // Send metadata first if provided
      if (metadata) {
        this.send({
          type: 'binary-metadata',
          payload: metadata
        });
      }

      this.socket!.send(data);
      this.emit('binary-sent', { size: data instanceof ArrayBuffer ? data.byteLength : data.size });
      return true;
    } catch (error) {
      this.logger.error('Failed to send binary data:', error);
      return false;
    }
  }

  // Private Methods
  private handleMessage(event: MessageEvent): void {
    try {
      let message: WebSocketMessage;

      if (typeof event.data === 'string') {
        message = JSON.parse(event.data);
      } else {
        // Handle binary data
        this.emit('binary-received', { data: event.data });
        return;
      }

      // Handle different message types
      switch (message.type) {
        case 'ping':
          this.send({ type: 'pong', payload: message.payload });
          break;
        case 'pong':
          this.emit('pong-received', message);
          break;
        case 'channel-message':
          this.handleChannelMessage(message);
          break;
        case 'broadcast':
          this.emit('broadcast-received', message);
          break;
        case 'data-stream':
          this.emit('data-stream-received', message);
          break;
        default:
          this.emit('message-received', message);
      }

    } catch (error) {
      this.logger.error('Failed to handle message:', error);
      this.emit('message-error', { error, rawData: event.data });
    }
  }

  private handleChannelMessage(message: WebSocketMessage): void {
    if (message.target) {
      const channel = this.channels.get(message.target);
      if (channel) {
        // Add to channel history
        channel.messageHistory.push(message);
        if (channel.maxHistory && channel.messageHistory.length > channel.maxHistory) {
          channel.messageHistory.shift();
        }

        this.emit('channel-message-received', { channel: message.target, message });
      }
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      this.connect().catch(() => {
        // Connection failed, will try again if attempts remaining
      });
    }, this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', payload: { timestamp: Date.now() } });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()!;
      this.send(message);
    }
  }

  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  // Utility Methods
  getConnectionState(): string {
    if (!this.socket) return 'CLOSED';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  getStats() {
    return {
      connected: this.connected,
      connectionState: this.getConnectionState(),
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      channels: this.channels.size,
      totalChannelSubscribers: Array.from(this.channels.values())
        .reduce((total, channel) => total + channel.subscribers.size, 0),
      environment: Environment.current()
    };
  }
  
  /**
   * Create enhanced WebSocket client for multi-agent communication
   */
  createMultiAgentClient(config?: Partial<BrolostackWSClientsideConfig>): BrolostackWSClientside {
    const enhancedConfig: any = {
      url: this.config.url,
      autoConnect: true,
      compression: this.config.compression,
      auth: this.config.authentication ? {
        apiKey: this.config.authentication.token || undefined,
        userId: this.config.authentication.username || undefined
      } : undefined,
      ...config
    };
    
    const client = new BrolostackWSClientside(enhancedConfig);
    
    this.logger.info('Enhanced WebSocket client created', {
      environment: Environment.current(),
      config: enhancedConfig
    });
    
    return client;
  }
  
  /**
   * Get environment-specific WebSocket configuration
   */
  getEnvironmentConfig(): {
    reconnectionAttempts: number;
    reconnectionDelay: number;
    timeout: number;
    compression: boolean;
    enableAuth: boolean;
  } {
    return {
      reconnectionAttempts: Environment.isProd() ? 10 : 5,
      reconnectionDelay: Environment.isProd() ? 1000 : 2000,
      timeout: Environment.isProd() ? 5000 : 10000,
      compression: Environment.isProd() || Environment.isStaging(),
      enableAuth: Environment.isProd() || Environment.isStaging()
    };
  }
}
