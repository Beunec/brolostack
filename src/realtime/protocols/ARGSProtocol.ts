/**
 * ARGS Protocol (Agent Real-time Governance & Streaming)
 * Invented by Olu Akinnawo within the Neo Cloud R&D project
 * 
 * A revolutionary protocol for multi-agent collaboration and streaming
 * Provides standardized communication patterns for AI agents
 */

export interface ARGSMessage {
  id: string;
  type: ARGSMessageType;
  timestamp: number;
  sessionId: string;
  agentId?: string | undefined;
  payload: any;
  metadata?: ARGSMetadata;
}

export type ARGSMessageType = 
  | 'AGENT_REGISTER'
  | 'AGENT_UNREGISTER'
  | 'TASK_START'
  | 'TASK_PROGRESS'
  | 'TASK_COMPLETE'
  | 'TASK_ERROR'
  | 'COLLABORATION_REQUEST'
  | 'COLLABORATION_RESPONSE'
  | 'STREAM_START'
  | 'STREAM_DATA'
  | 'STREAM_END'
  | 'HEARTBEAT'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE';

export interface ARGSMetadata {
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryCount?: number;
  maxRetries?: number;
  ttl?: number; // Time to live in milliseconds
  requiresAck?: boolean;
  correlationId?: string;
  sourceAgent?: string;
  targetAgent?: string | undefined;
  environment?: string;
}

export interface ARGSAgentInfo {
  id: string;
  type: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline' | 'error';
  metadata: {
    name: string;
    version: string;
    description?: string;
    maxConcurrentTasks: number;
    currentTasks: number;
  };
}

export interface ARGSTaskDefinition {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requirements: {
    agentTypes: string[];
    capabilities: string[];
    maxExecutionTime?: number;
    resourceRequirements?: {
      memory?: number;
      cpu?: number;
      gpu?: boolean;
    };
  };
  payload: any;
  collaborationMode: 'sequential' | 'parallel' | 'hybrid';
  dependencies?: string[]; // Task IDs this task depends on
}

export interface ARGSTaskProgress {
  taskId: string;
  agentId: string;
  step: string;
  status: 'started' | 'processing' | 'completed' | 'error' | 'paused';
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number;
  subTasks?: ARGSTaskProgress[];
  metrics?: {
    executionTime: number;
    memoryUsage?: number;
    cpuUsage?: number;
    errorCount: number;
  };
}

export interface ARGSCollaborationRequest {
  requestId: string;
  requestingAgent: string;
  targetAgent?: string; // If null, broadcast to all capable agents
  taskId: string;
  collaborationType: 'assistance' | 'delegation' | 'review' | 'merge';
  requiredCapabilities: string[];
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  context: any;
  deadline?: number;
}

export interface ARGSStreamConfig {
  streamId: string;
  type: 'text' | 'binary' | 'json' | 'media';
  compression?: boolean;
  encryption?: boolean;
  chunkSize?: number;
  bufferSize?: number;
  qualityOfService: 'best-effort' | 'guaranteed' | 'real-time';
}

export class ARGSProtocolHandler {
  private messageHandlers: Map<ARGSMessageType, Function[]> = new Map();
  private agents: Map<string, ARGSAgentInfo> = new Map();
  // private tasks: Map<string, ARGSTaskDefinition> = new Map(); // Reserved for future use
  private collaborationRequests: Map<string, ARGSCollaborationRequest> = new Map();
  
  constructor() {
    this.initializeHandlers();
  }
  
  private initializeHandlers(): void {
    // Initialize default handlers for each message type
    Object.values([
      'AGENT_REGISTER', 'AGENT_UNREGISTER', 'TASK_START', 'TASK_PROGRESS',
      'TASK_COMPLETE', 'TASK_ERROR', 'COLLABORATION_REQUEST', 'COLLABORATION_RESPONSE',
      'STREAM_START', 'STREAM_DATA', 'STREAM_END', 'HEARTBEAT', 'SYNC_REQUEST', 'SYNC_RESPONSE'
    ] as ARGSMessageType[]).forEach(type => {
      this.messageHandlers.set(type, []);
    });
  }
  
  /**
   * Register a message handler for a specific message type
   */
  onMessage(type: ARGSMessageType, handler: (message: ARGSMessage) => void | Promise<void>): void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);
  }
  
  /**
   * Process an incoming ARGS message
   */
  async processMessage(message: ARGSMessage): Promise<void> {
    // Validate message structure
    if (!this.validateMessage(message)) {
      throw new Error(`Invalid ARGS message structure: ${JSON.stringify(message)}`);
    }
    
    // Check TTL
    if (message.metadata?.ttl && (Date.now() - message.timestamp) > message.metadata.ttl) {
      console.warn(`ARGS message expired: ${message.id}`);
      return;
    }
    
    // Process message based on type
    const handlers = this.messageHandlers.get(message.type) || [];
    
    for (const handler of handlers) {
      try {
        await handler(message);
      } catch (error) {
        console.error(`Error processing ARGS message ${message.id}:`, error);
        
        // Send error response if required
        if (message.metadata?.requiresAck) {
          // Implementation would send error acknowledgment
        }
      }
    }
  }
  
  /**
   * Create a standardized ARGS message
   */
  createMessage(
    type: ARGSMessageType,
    sessionId: string,
    payload: any,
    options?: {
      agentId?: string;
      metadata?: Partial<ARGSMetadata>;
    }
  ): ARGSMessage {
    return {
      id: this.generateMessageId(),
      type,
      timestamp: Date.now(),
      sessionId,
      agentId: options?.agentId,
      payload,
      metadata: {
        priority: 'medium',
        requiresAck: false,
        ...options?.metadata
      }
    };
  }
  
  /**
   * Register an agent in the ARGS system
   */
  registerAgent(agentInfo: ARGSAgentInfo): ARGSMessage {
    this.agents.set(agentInfo.id, agentInfo);
    
    return this.createMessage('AGENT_REGISTER', 'system', agentInfo, {
      agentId: agentInfo.id,
      metadata: { priority: 'high', requiresAck: true }
    });
  }
  
  /**
   * Create a collaboration request between agents
   */
  createCollaborationRequest(request: ARGSCollaborationRequest): ARGSMessage {
    this.collaborationRequests.set(request.requestId, request);
    
    return this.createMessage('COLLABORATION_REQUEST', 'collaboration', request, {
      agentId: request.requestingAgent,
      metadata: {
        priority: request.urgency === 'immediate' ? 'critical' : 'high',
        requiresAck: true,
        targetAgent: request.targetAgent,
        correlationId: request.requestId
      }
    });
  }
  
  /**
   * Create a task progress update
   */
  createProgressUpdate(progress: ARGSTaskProgress, sessionId: string): ARGSMessage {
    return this.createMessage('TASK_PROGRESS', sessionId, progress, {
      agentId: progress.agentId,
      metadata: {
        priority: progress.status === 'error' ? 'high' : 'medium',
        correlationId: progress.taskId
      }
    });
  }
  
  /**
   * Validate ARGS message structure
   */
  private validateMessage(message: ARGSMessage): boolean {
    return !!(
      message.id &&
      message.type &&
      message.timestamp &&
      message.sessionId &&
      message.payload !== undefined
    );
  }
  
  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `args_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get registered agents
   */
  getAgents(): Map<string, ARGSAgentInfo> {
    return new Map(this.agents);
  }
  
  /**
   * Find agents by capability
   */
  findAgentsByCapability(capability: string): ARGSAgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => 
      agent.capabilities.includes(capability) && agent.status !== 'offline'
    );
  }
  
  /**
   * Get collaboration requests
   */
  getCollaborationRequests(): Map<string, ARGSCollaborationRequest> {
    return new Map(this.collaborationRequests);
  }
}

// Export protocol constants
export const ARGS_VERSION = '1.0.0';
export const ARGS_PROTOCOL_NAME = 'ARGS';

// Default configurations
export const DEFAULT_ARGS_CONFIG = {
  heartbeatInterval: 30000, // 30 seconds
  messageTimeout: 60000, // 1 minute
  maxRetries: 3,
  compressionThreshold: 1024, // 1KB
  maxMessageSize: 10 * 1024 * 1024, // 10MB
  queueSize: 1000
};
