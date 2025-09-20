/**
 * Real-time Communication Types for Brolostack
 * Enhanced with ARGS Protocol and Multi-Agent Support
 */

// Legacy WebSocket types (maintained for backward compatibility)
export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  compression?: boolean;
  enableMetrics?: boolean;
}

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  sender?: string;
}

export interface WebSocketRoom {
  id: string;
  name: string;
  members: string[];
  createdAt: number;
  lastActivity: number;
}

// Enhanced WebSocket types for multi-agent and client-side communication
export interface EnhancedWebSocketConfig {
  // Connection settings
  url?: string;
  path?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  
  // Security settings
  auth?: {
    apiKey?: string;
    token?: string;
    userId?: string;
    sessionToken?: string;
  };
  
  // Performance settings
  compression?: boolean;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
  
  // Feature settings
  messageQueue?: {
    enabled: boolean;
    maxSize: number;
    persistOffline: boolean;
  };
  
  // Monitoring settings
  performance?: {
    enableMetrics: boolean;
    sampleRate: number;
    enableLatencyTracking: boolean;
  };
  
  // Environment settings
  environment?: {
    enableDevTools: boolean;
    enableDebugLogging: boolean;
    enableErrorReporting: boolean;
  };
}

// Multi-Agent specific types
export interface AgentProgressUpdate {
  agentId: string;
  agentType: string;
  step: string;
  status: 'started' | 'processing' | 'completed' | 'error' | 'paused';
  progress: number; // 0-100
  message?: string;
  timestamp: number;
  estimatedTimeRemaining?: number;
  metadata?: {
    executionTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    errorCount?: number;
  };
}

export interface RealtimeExecutionStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  startTime?: number;
  endTime?: number;
  message?: string;
  progress: number;
  dependencies?: string[];
  assignedAgent?: string;
  subSteps?: RealtimeExecutionStep[];
}

export interface RealtimeExecutionProcess {
  sessionId: string;
  processId: string;
  name: string;
  description?: string;
  agentType: string;
  overallStatus: 'initializing' | 'running' | 'completed' | 'error' | 'paused' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  steps: RealtimeExecutionStep[];
  startTime: number;
  endTime?: number;
  estimatedTimeRemaining?: number;
  metadata?: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    requester: string;
    environment: string;
    version: string;
  };
}

// Client-side specific types
export interface ClientWebSocketRoom {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct' | 'group';
  memberCount: number;
  joinedAt: number;
  lastActivity: number;
  messageCount: number;
  unreadCount: number;
  metadata?: {
    description?: string;
    tags?: string[];
    permissions?: {
      canSend: boolean;
      canInvite: boolean;
      canLeave: boolean;
    };
  };
}

export interface ClientMessage {
  id: string;
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system' | 'agent';
  content: any;
  sender: {
    id: string;
    name: string;
    type: 'user' | 'agent' | 'system';
    avatar?: string;
  };
  room: string;
  timestamp: number;
  edited?: boolean;
  editedAt?: number;
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    expiresAt?: number;
    encrypted?: boolean;
    fileInfo?: {
      name: string;
      size: number;
      type: string;
      url: string;
    };
  };
}

// Streaming types
export interface StreamConfig {
  streamId: string;
  type: 'text' | 'binary' | 'json' | 'media' | 'agent-output';
  compression?: boolean;
  encryption?: boolean;
  chunkSize?: number;
  bufferSize?: number;
  qualityOfService?: 'best-effort' | 'guaranteed' | 'real-time';
  metadata?: {
    source: string;
    target?: string;
    contentType?: string;
    totalSize?: number;
  };
}

export interface StreamChunk {
  streamId: string;
  sequenceNumber: number;
  data: any;
  isLast: boolean;
  timestamp: number;
  checksum?: string;
}

// Collaboration types
export interface CollaborationSession {
  sessionId: string;
  type: 'document' | 'whiteboard' | 'code' | 'design' | 'meeting' | 'agent-task';
  participants: {
    id: string;
    name: string;
    role: 'owner' | 'editor' | 'viewer' | 'agent';
    joinedAt: number;
    lastActivity: number;
    cursor?: {
      x: number;
      y: number;
      element?: string;
    };
  }[];
  document?: {
    id: string;
    version: number;
    content: any;
    lastModified: number;
    modifiedBy: string;
  };
  locks?: {
    elementId: string;
    lockedBy: string;
    lockedAt: number;
    expiresAt: number;
  }[];
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: number;
  lastActivity: number;
}

// Connection status types
export interface ConnectionStatus {
  connected: boolean;
  environment: string;
  socketId?: string;
  connectionTime?: number;
  reconnectCount: number;
  lastError?: string;
  latency?: number;
  serverVersion?: string;
  protocolVersion?: string;
}

// Event types for type-safe event handling
export interface WebSocketEvents {
  // Connection events
  'connected': { socketId: string; timestamp: number };
  'disconnected': { reason: string; timestamp: number };
  'reconnected': { attemptNumber: number; timestamp: number };
  'connection-error': { error: string; timestamp: number };
  
  // Room events
  'room-joined': { roomId: string; roomName: string; memberCount: number };
  'room-left': { roomId: string };
  'user-joined': { roomId: string; userId: string; userInfo?: any };
  'user-left': { roomId: string; userId: string };
  
  // Message events
  'message': ClientMessage;
  'message-sent': { event: string; data: any; timestamp: number };
  'message-queued': { message: any; queueSize: number };
  'queue-processed': { processedCount: number };
  
  // Agent events
  'agent-registered': { sessionId: string; agent: any; timestamp: number };
  'task-assigned': { taskId: string; agentId: string; mode: string; timestamp: number };
  'task-progress': { sessionId: string; progress: AgentProgressUpdate; timestamp: number };
  'task-completed': { taskId: string; result: any; timestamp: number };
  'task-error': { taskId: string; error: string; timestamp: number };
  
  // Collaboration events
  'collaboration-request': { requestId: string; fromAgent: string; toAgent: string; type: string };
  'collaboration-response': { requestId: string; accepted: boolean; response?: any };
  
  // Stream events
  'stream-started': { streamId: string; type: string; config: StreamConfig };
  'stream-data': { streamId: string; chunk: any; isLast: boolean };
  'stream-ended': { streamId: string; timestamp: number };
  
  // Performance events
  'latency-updated': { latency: number; average: number };
  'performance-metrics': { metrics: any; timestamp: number };
}

// Backend integration types
export interface BackendIntegration {
  nodejs?: {
    framework: 'express' | 'nestjs' | 'fastify' | 'koa';
    port: number;
    middleware?: string[];
    cors?: {
      origin: string | string[];
      credentials: boolean;
    };
  };
  python?: {
    framework: 'fastapi' | 'django' | 'flask' | 'tornado';
    host: string;
    port: number;
    middleware?: string[];
    cors?: {
      origins: string[];
      allow_credentials: boolean;
    };
  };
}

// All interfaces are automatically exported via 'export interface' declarations above
