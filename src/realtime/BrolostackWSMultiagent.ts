/**
 * BrolostackWSMultiagent - Revolutionary Multi-Agent WebSocket Framework
 * Powered by ARGS Protocol for seamless agent collaboration and streaming
 * 
 * Features:
 * - Multi-agent task coordination
 * - Real-time progress streaming
 * - Environment-aware configurations
 * - Node.js and Python backend compatibility
 * - Enterprise-grade security and performance
 */

// Dynamic import for Socket.IO server (optional dependency)
type SocketIOServer = any;
type Socket = any;
import { Server as HTTPServer } from 'http';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { Environment, environmentManager } from '../core/EnvironmentManager';
import { 
  ARGSProtocolHandler, 
  ARGSMessage, 
  ARGSAgentInfo, 
  ARGSTaskDefinition, 
  ARGSTaskProgress,
  ARGSCollaborationRequest,
  ARGSStreamConfig,
} from './protocols/ARGSProtocol';

export interface BrolostackWSMultiagentConfig {
  port?: number;
  path?: string;
  cors?: {
    origin: string | string[] | boolean;
    methods?: string[];
    credentials?: boolean;
  };
  compression?: boolean;
  heartbeatInterval?: number;
  maxConnections?: number;
  rateLimiting?: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxConcurrentTasks: number;
  };
  security?: {
    enableAuth: boolean;
    apiKeyRequired: boolean;
    allowedOrigins: string[];
    enableEncryption: boolean;
  };
  agents?: {
    maxAgentsPerSession: number;
    taskTimeout: number;
    collaborationTimeout: number;
    autoCleanupInterval: number;
  };
}

export interface MultiAgentSession {
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  status: 'active' | 'paused' | 'completed' | 'error';
  agents: Map<string, ARGSAgentInfo>;
  tasks: Map<string, ARGSTaskDefinition>;
  activeStreams: Map<string, ARGSStreamConfig>;
  collaborationRequests: Map<string, ARGSCollaborationRequest>;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    errorCount: number;
    avgExecutionTime: number;
  };
}

export class BrolostackWSMultiagent extends EventEmitter {
  private io: SocketIOServer;
  private logger: Logger;
  private argsHandler: ARGSProtocolHandler;
  private config: BrolostackWSMultiagentConfig;
  private sessions: Map<string, MultiAgentSession> = new Map();
  private connectedClients: Map<string, Socket> = new Map();
  // private taskQueue: Map<string, ARGSTaskDefinition[]> = new Map(); // Reserved for future use
  
  constructor(server: HTTPServer, config: Partial<BrolostackWSMultiagentConfig> = {}) {
    super();
    
    // Apply environment-specific configuration
    this.config = this.createEnvironmentConfig(config);
    this.logger = new Logger(Environment.isDev(), 'BrolostackWSMultiagent');
    this.argsHandler = new ARGSProtocolHandler();
    
    // Initialize Socket.IO server with dynamic import
    this.initializeSocketIO(server);
    
    this.logger.info('BrolostackWSMultiagent initialized', {
      environment: Environment.current(),
      config: this.config,
      argsVersion: '1.0.0'
    });
  }
  
  /**
   * Initialize Socket.IO with dynamic import
   */
  private async initializeSocketIO(server: HTTPServer): Promise<void> {
    try {
      // Dynamic import for Socket.IO (optional dependency)
      const socketio = await import('socket.io');
      const { Server } = socketio;
      
      this.io = new Server(server, {
        path: this.config.path || '/brolostack-multiagent',
        cors: this.config.cors,
        compression: this.config.compression,
        transports: ['websocket', 'polling'],
        pingTimeout: this.config.heartbeatInterval,
        pingInterval: (this.config.heartbeatInterval || 30000) / 2
      });
      
      this.setupEventHandlers();
      this.setupARGSProtocol();
      this.startCleanupTimer();
      
      this.logger.info('Socket.IO server initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Socket.IO server. Please install socket.io:', error);
      throw new Error('Socket.IO is required for BrolostackWSMultiagent. Install with: npm install socket.io');
    }
  }
  
  /**
   * Create environment-specific configuration
   */
  private createEnvironmentConfig(userConfig: Partial<BrolostackWSMultiagentConfig>): BrolostackWSMultiagentConfig {
    const envConfig = environmentManager.getConfig();
    const baseConfig: BrolostackWSMultiagentConfig = {
      port: 3001,
      path: '/brolostack-multiagent',
      compression: envConfig.performance.enableCompression,
      heartbeatInterval: 30000,
      maxConnections: Environment.isProd() ? 10000 : 100,
      rateLimiting: {
        enabled: Environment.isProd() || Environment.isStaging(),
        maxRequestsPerMinute: Environment.isProd() ? 1000 : 10000,
        maxConcurrentTasks: Environment.isProd() ? 100 : 10
      },
      security: {
        enableAuth: Environment.isProd() || Environment.isStaging(),
        apiKeyRequired: Environment.isProd(),
        allowedOrigins: Environment.isDev() 
          ? ['http://localhost:3000', 'http://localhost:3001']
          : (process.env['ALLOWED_ORIGINS']?.split(',') || []),
        enableEncryption: envConfig.storage.encryption
      },
      agents: {
        maxAgentsPerSession: Environment.isProd() ? 50 : 10,
        taskTimeout: Environment.isProd() ? 300000 : 600000, // 5 min prod, 10 min dev
        collaborationTimeout: 60000,
        autoCleanupInterval: Environment.isProd() ? 300000 : 600000
      }
    };
    
    // Apply CORS configuration based on environment
    baseConfig.cors = {
      origin: Environment.isDev() 
        ? true 
        : baseConfig.security!.allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: !Environment.isDev()
    };
    
    return { ...baseConfig, ...userConfig };
  }
  
  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleClientConnection(socket);
    });
    
    // Handle server-level events
    this.io.engine.on('connection_error', (err: any) => {
      this.logger.error('Socket.IO connection error:', err);
      this.emit('connection-error', err);
    });
  }
  
  /**
   * Handle individual client connections
   */
  private handleClientConnection(socket: Socket): void {
    const clientId = socket.id;
    const clientIP = socket.handshake.address;
    
    this.connectedClients.set(clientId, socket);
    
    this.logger.info('Multi-agent client connected', {
      clientId,
      clientIP,
      userAgent: socket.handshake.headers['user-agent'],
      environment: Environment.current()
    });
    
    // Authentication check
    if (this.config.security?.enableAuth) {
      this.authenticateClient(socket);
    }
    
    // Setup client event handlers
    this.setupClientHandlers(socket);
    
    // Send welcome message with ARGS protocol info
    socket.emit('args-welcome', {
      protocol: 'ARGS',
      version: '1.0.0',
      environment: Environment.current(),
      capabilities: this.getServerCapabilities(),
      timestamp: Date.now()
    });
    
    socket.on('disconnect', (reason: any) => {
      this.handleClientDisconnection(socket, reason);
    });
  }
  
  /**
   * Setup ARGS protocol handlers
   */
  private setupARGSProtocol(): void {
    // Agent registration
    this.argsHandler.onMessage('AGENT_REGISTER', async (message: ARGSMessage) => {
      await this.handleAgentRegistration(message);
    });
    
    // Task management
    this.argsHandler.onMessage('TASK_START', async (message: ARGSMessage) => {
      await this.handleTaskStart(message);
    });
    
    this.argsHandler.onMessage('TASK_PROGRESS', async (message: ARGSMessage) => {
      await this.handleTaskProgress(message);
    });
    
    // Collaboration
    this.argsHandler.onMessage('COLLABORATION_REQUEST', async (message: ARGSMessage) => {
      await this.handleCollaborationRequest(message);
    });
    
    // Streaming
    this.argsHandler.onMessage('STREAM_START', async (message: ARGSMessage) => {
      await this.handleStreamStart(message);
    });
    
    this.argsHandler.onMessage('STREAM_DATA', async (message: ARGSMessage) => {
      await this.handleStreamData(message);
    });
  }
  
  /**
   * Setup client-specific event handlers
   */
  private setupClientHandlers(socket: Socket): void {
    // Session management
    socket.on('join-session', (sessionId: string) => {
      this.handleJoinSession(socket, sessionId);
    });
    
    socket.on('leave-session', (sessionId: string) => {
      this.handleLeaveSession(socket, sessionId);
    });
    
    // Agent operations
    socket.on('register-agent', (agentInfo: ARGSAgentInfo) => {
      this.handleRegisterAgent(socket, agentInfo);
    });
    
    socket.on('start-task', (taskDef: ARGSTaskDefinition) => {
      this.handleStartTask(socket, taskDef);
    });
    
    socket.on('agent-progress', (progress: ARGSTaskProgress) => {
      this.handleAgentProgress(socket, progress);
    });
    
    // Collaboration
    socket.on('collaboration-request', (request: ARGSCollaborationRequest) => {
      this.handleCollaborationRequestFromSocket(socket, request);
    });
    
    // Streaming
    socket.on('start-stream', (config: ARGSStreamConfig) => {
      this.handleStartStream(socket, config);
    });
    
    socket.on('stream-chunk', (data: { streamId: string; chunk: any }) => {
      this.handleStreamChunk(socket, data);
    });
    
    // ARGS protocol messages
    socket.on('args-message', (message: ARGSMessage) => {
      this.handleARGSMessage(socket, message);
    });
  }
  
  /**
   * Handle agent registration
   */
  private async handleAgentRegistration(message: ARGSMessage): Promise<void> {
    const agentInfo: ARGSAgentInfo = message.payload;
    const session = this.getOrCreateSession(message.sessionId);
    
    session.agents.set(agentInfo.id, agentInfo);
    session.lastActivity = Date.now();
    
    // Broadcast agent registration to session
    this.io.to(message.sessionId).emit('agent-registered', {
      sessionId: message.sessionId,
      agent: agentInfo,
      timestamp: Date.now()
    });
    
    this.logger.info('Agent registered', {
      sessionId: message.sessionId,
      agentId: agentInfo.id,
      agentType: agentInfo.type,
      capabilities: agentInfo.capabilities
    });
  }
  
  /**
   * Handle task start
   */
  private async handleTaskStart(message: ARGSMessage): Promise<void> {
    const taskDef: ARGSTaskDefinition = message.payload;
    const session = this.getOrCreateSession(message.sessionId);
    
    session.tasks.set(taskDef.id, taskDef);
    session.metrics.totalTasks++;
    session.lastActivity = Date.now();
    
    // Find suitable agents for the task
    const suitableAgents = this.findSuitableAgents(session, taskDef);
    
    if (suitableAgents.length === 0) {
      this.io.to(message.sessionId).emit('task-error', {
        taskId: taskDef.id,
        error: 'No suitable agents found for task',
        timestamp: Date.now()
      });
      return;
    }
    
    // Assign task to agents based on collaboration mode
    await this.assignTaskToAgents(session, taskDef, suitableAgents);
    
    this.logger.info('Task started', {
      sessionId: message.sessionId,
      taskId: taskDef.id,
      taskType: taskDef.type,
      assignedAgents: suitableAgents.map(a => a.id)
    });
  }
  
  /**
   * Handle task progress updates
   */
  private async handleTaskProgress(message: ARGSMessage): Promise<void> {
    const progress: ARGSTaskProgress = message.payload;
    const session = this.sessions.get(message.sessionId);
    
    if (!session) {
      this.logger.warn('Progress update for unknown session', { sessionId: message.sessionId });
      return;
    }
    
    session.lastActivity = Date.now();
    
    // Broadcast progress to all clients in session
    this.io.to(message.sessionId).emit('task-progress', {
      sessionId: message.sessionId,
      progress,
      timestamp: Date.now()
    });
    
    // Check if task is complete
    if (progress.status === 'completed') {
      session.metrics.completedTasks++;
      this.updateSessionMetrics(session, progress);
    } else if (progress.status === 'error') {
      session.metrics.errorCount++;
    }
  }
  
  /**
   * Handle collaboration requests between agents
   */
  private async handleCollaborationRequest(message: ARGSMessage): Promise<void> {
    const request: ARGSCollaborationRequest = message.payload;
    const session = this.sessions.get(message.sessionId);
    
    if (!session) return;
    
    session.collaborationRequests.set(request.requestId, request);
    session.lastActivity = Date.now();
    
    // Find target agents
    const targetAgents = request.targetAgent 
      ? [session.agents.get(request.targetAgent)].filter(Boolean)
      : this.findAgentsByCapabilities(session, request.requiredCapabilities);
    
    // Send collaboration request to target agents
    for (const agent of targetAgents) {
      this.io.to(message.sessionId).emit('collaboration-request', {
        requestId: request.requestId,
        fromAgent: request.requestingAgent,
        toAgent: agent!.id,
        type: request.collaborationType,
        context: request.context,
        urgency: request.urgency,
        deadline: request.deadline,
        timestamp: Date.now()
      });
    }
    
    this.logger.info('Collaboration request sent', {
      sessionId: message.sessionId,
      requestId: request.requestId,
      fromAgent: request.requestingAgent,
      targetAgents: targetAgents.map(a => a!.id)
    });
  }
  
  /**
   * Handle stream start
   */
  private async handleStreamStart(message: ARGSMessage): Promise<void> {
    const streamConfig: ARGSStreamConfig = message.payload;
    const session = this.sessions.get(message.sessionId);
    
    if (!session) return;
    
    session.activeStreams.set(streamConfig.streamId, streamConfig);
    session.lastActivity = Date.now();
    
    // Setup stream room
    const streamRoom = `${message.sessionId}:stream:${streamConfig.streamId}`;
    
    // Broadcast stream start
    this.io.to(message.sessionId).emit('stream-started', {
      streamId: streamConfig.streamId,
      type: streamConfig.type,
      config: streamConfig,
      room: streamRoom,
      timestamp: Date.now()
    });
    
    this.logger.info('Stream started', {
      sessionId: message.sessionId,
      streamId: streamConfig.streamId,
      type: streamConfig.type
    });
  }
  
  /**
   * Handle stream data
   */
  private async handleStreamData(message: ARGSMessage): Promise<void> {
    const { streamId, chunk, isLast } = message.payload;
    const streamRoom = `${message.sessionId}:stream:${streamId}`;
    
    // Broadcast stream data to all subscribers
    this.io.to(streamRoom).emit('stream-data', {
      streamId,
      chunk,
      isLast,
      timestamp: Date.now()
    });
    
    if (isLast) {
      const session = this.sessions.get(message.sessionId);
      if (session) {
        session.activeStreams.delete(streamId);
        this.io.to(streamRoom).emit('stream-ended', {
          streamId,
          timestamp: Date.now()
        });
      }
    }
  }
  
  /**
   * Client event handlers
   */
  private handleJoinSession(socket: Socket, sessionId: string): void {
    socket.join(sessionId);
    
    const session = this.getOrCreateSession(sessionId);
    session.lastActivity = Date.now();
    
    // Send current session state
    socket.emit('session-state', {
      sessionId,
      agents: Array.from(session.agents.values()),
      activeTasks: Array.from(session.tasks.values()),
      metrics: session.metrics,
      timestamp: Date.now()
    });
    
    this.logger.info('Client joined session', {
      clientId: socket.id,
      sessionId,
      agentCount: session.agents.size,
      taskCount: session.tasks.size
    });
  }
  
  private handleLeaveSession(socket: Socket, sessionId: string): void {
    socket.leave(sessionId);
    
    this.logger.info('Client left session', {
      clientId: socket.id,
      sessionId
    });
  }
  
  private handleRegisterAgent(socket: Socket, agentInfo: ARGSAgentInfo): void {
    // Get session from socket rooms
    const rooms = Array.from(socket.rooms) as string[];
    const sessionId = rooms.find(room => room !== socket.id) || 'default';
    
    const message = this.argsHandler.createMessage('AGENT_REGISTER', sessionId || 'default', agentInfo, {
      agentId: agentInfo.id
    });
    
    this.argsHandler.processMessage(message);
  }
  
  private handleStartTask(socket: Socket, taskDef: ARGSTaskDefinition): void {
    const rooms = Array.from(socket.rooms) as string[];
    const sessionId = rooms.find(room => room !== socket.id) || 'default';
    
    const message = this.argsHandler.createMessage('TASK_START', sessionId || 'default', taskDef);
    this.argsHandler.processMessage(message);
  }
  
  private handleAgentProgress(socket: Socket, progress: ARGSTaskProgress): void {
    const rooms = Array.from(socket.rooms) as string[];
    const sessionId = rooms.find(room => room !== socket.id) || 'default';
    
    const message = this.argsHandler.createMessage('TASK_PROGRESS', sessionId || 'default', progress, {
      agentId: progress.agentId
    });
    
    this.argsHandler.processMessage(message);
  }
  
  private handleCollaborationRequestFromSocket(socket: Socket, request: ARGSCollaborationRequest): void {
    const rooms = Array.from(socket.rooms) as string[];
    const sessionId = rooms.find(room => room !== socket.id) || 'default';
    
    const message = this.argsHandler.createMessage('COLLABORATION_REQUEST', sessionId || 'default', request, {
      agentId: request.requestingAgent
    });
    
    this.argsHandler.processMessage(message);
  }
  
  private handleStartStream(socket: Socket, config: ARGSStreamConfig): void {
    const rooms = Array.from(socket.rooms) as string[];
    const sessionId = rooms.find(room => room !== socket.id) || 'default';
    
    const message = this.argsHandler.createMessage('STREAM_START', sessionId || 'default', config);
    this.argsHandler.processMessage(message);
    
    // Join stream room for data broadcasting
    const streamRoom = `${sessionId}:stream:${config.streamId}`;
    socket.join(streamRoom);
  }
  
  private handleStreamChunk(socket: Socket, data: { streamId: string; chunk: any }): void {
    const rooms = Array.from(socket.rooms) as string[];
    const sessionId = rooms.find(room => room !== socket.id && !room.includes('stream')) || 'default';
    
    const message = this.argsHandler.createMessage('STREAM_DATA', sessionId || 'default', data);
    this.argsHandler.processMessage(message);
  }
  
  private handleARGSMessage(_socket: Socket, message: ARGSMessage): void {
    this.argsHandler.processMessage(message);
  }
  
  /**
   * Authentication for production environments
   */
  private authenticateClient(socket: Socket): void {
    const apiKey = socket.handshake.auth?.apiKey || socket.handshake.headers['x-api-key'];
    
    if (this.config.security?.apiKeyRequired && !apiKey) {
      socket.emit('auth-error', { message: 'API key required' });
      socket.disconnect();
      return;
    }
    
    // In production, validate API key against your auth system
    if (Environment.isProd() && apiKey) {
      // Implement API key validation logic here
      this.validateApiKey(apiKey).then(valid => {
        if (!valid) {
          socket.emit('auth-error', { message: 'Invalid API key' });
          socket.disconnect();
        }
      });
    }
  }
  
  private async validateApiKey(apiKey: string): Promise<boolean> {
    // Implement your API key validation logic
    // This could check against a database, JWT validation, etc.
    return apiKey.length > 10; // Placeholder validation
  }
  
  /**
   * Handle client disconnection
   */
  private handleClientDisconnection(socket: Socket, reason: string): void {
    const clientId = socket.id;
    this.connectedClients.delete(clientId);
    
    this.logger.info('Multi-agent client disconnected', {
      clientId,
      reason,
      environment: Environment.current()
    });
    
    this.emit('client-disconnected', { clientId, reason });
  }
  
  /**
   * Utility methods
   */
  private getOrCreateSession(sessionId: string): MultiAgentSession {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        status: 'active',
        agents: new Map(),
        tasks: new Map(),
        activeStreams: new Map(),
        collaborationRequests: new Map(),
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          errorCount: 0,
          avgExecutionTime: 0
        }
      };
      
      this.sessions.set(sessionId, session);
      this.emit('session-created', { sessionId, timestamp: Date.now() });
    }
    
    return session;
  }
  
  private findSuitableAgents(session: MultiAgentSession, task: ARGSTaskDefinition): ARGSAgentInfo[] {
    return Array.from(session.agents.values()).filter(agent => {
      // Check agent type
      if (!task.requirements.agentTypes.includes(agent.type)) {
        return false;
      }
      
      // Check capabilities
      const hasRequiredCapabilities = task.requirements.capabilities.every(cap => 
        agent.capabilities.includes(cap)
      );
      
      if (!hasRequiredCapabilities) {
        return false;
      }
      
      // Check availability
      if (agent.status !== 'idle' && agent.metadata.currentTasks >= agent.metadata.maxConcurrentTasks) {
        return false;
      }
      
      return true;
    });
  }
  
  private findAgentsByCapabilities(session: MultiAgentSession, capabilities: string[]): ARGSAgentInfo[] {
    return Array.from(session.agents.values()).filter(agent =>
      capabilities.every(cap => agent.capabilities.includes(cap))
    );
  }
  
  private async assignTaskToAgents(
    session: MultiAgentSession, 
    task: ARGSTaskDefinition, 
    agents: ARGSAgentInfo[]
  ): Promise<void> {
    switch (task.collaborationMode) {
      case 'sequential':
        await this.assignSequentialTask(session, task, agents);
        break;
      case 'parallel':
        await this.assignParallelTask(session, task, agents);
        break;
      case 'hybrid':
        await this.assignHybridTask(session, task, agents);
        break;
    }
  }
  
  private async assignSequentialTask(
    session: MultiAgentSession, 
    task: ARGSTaskDefinition, 
    agents: ARGSAgentInfo[]
  ): Promise<void> {
    // Assign to first available agent
    const agent = agents[0];
    
    if (!agent) {
      this.logger.warn('No agents available for sequential task assignment');
      return;
    }
    
    this.io.to(session.sessionId).emit('task-assigned', {
      taskId: task.id,
      agentId: agent.id,
      mode: 'sequential',
      timestamp: Date.now()
    });
  }
  
  private async assignParallelTask(
    session: MultiAgentSession, 
    task: ARGSTaskDefinition, 
    agents: ARGSAgentInfo[]
  ): Promise<void> {
    // Assign to all suitable agents
    for (const agent of agents) {
      this.io.to(session.sessionId).emit('task-assigned', {
        taskId: task.id,
        agentId: agent.id,
        mode: 'parallel',
        timestamp: Date.now()
      });
    }
  }
  
  private async assignHybridTask(
    session: MultiAgentSession, 
    task: ARGSTaskDefinition, 
    agents: ARGSAgentInfo[]
  ): Promise<void> {
    // Implement hybrid assignment logic
    // This could involve assigning different parts of the task to different agents
    const primaryAgent = agents[0];
    const supportAgents = agents.slice(1);
    
    if (!primaryAgent) {
      this.logger.warn('No primary agent available for hybrid task assignment');
      return;
    }
    
    this.io.to(session.sessionId).emit('task-assigned', {
      taskId: task.id,
      primaryAgent: primaryAgent.id,
      supportAgents: supportAgents.map(a => a.id),
      mode: 'hybrid',
      timestamp: Date.now()
    });
  }
  
  private updateSessionMetrics(session: MultiAgentSession, progress: ARGSTaskProgress): void {
    if (progress.metrics?.executionTime) {
      const { avgExecutionTime, completedTasks } = session.metrics;
      session.metrics.avgExecutionTime = 
        (avgExecutionTime * (completedTasks - 1) + progress.metrics.executionTime) / completedTasks;
    }
  }
  
  private getServerCapabilities(): string[] {
    return [
      'multi-agent-coordination',
      'real-time-streaming',
      'task-distribution',
      'collaboration-management',
      'progress-tracking',
      'args-protocol',
      Environment.current()
    ];
  }
  
  /**
   * Cleanup inactive sessions
   */
  private startCleanupTimer(): void {
    const interval = this.config.agents?.autoCleanupInterval || 300000; // 5 minutes
    
    setInterval(() => {
      const now = Date.now();
      const inactiveThreshold = interval * 2; // 10 minutes of inactivity
      
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now - session.lastActivity > inactiveThreshold) {
          this.cleanupSession(sessionId);
        }
      }
    }, interval);
  }
  
  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // Notify clients
    this.io.to(sessionId).emit('session-cleanup', {
      sessionId,
      reason: 'inactivity',
      timestamp: Date.now()
    });
    
    // Remove from active sessions
    this.sessions.delete(sessionId);
    
    this.logger.info('Session cleaned up', { sessionId });
    this.emit('session-cleaned', { sessionId });
  }
  
  /**
   * Public API methods
   */
  
  /**
   * Get all active sessions
   */
  getActiveSessions(): Map<string, MultiAgentSession> {
    return new Map(this.sessions);
  }
  
  /**
   * Get session by ID
   */
  getSession(sessionId: string): MultiAgentSession | undefined {
    return this.sessions.get(sessionId);
  }
  
  /**
   * Broadcast message to all clients in a session
   */
  broadcastToSession(sessionId: string, event: string, data: any): void {
    this.io.to(sessionId).emit(event, {
      ...data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Send message to specific agent
   */
  sendToAgent(sessionId: string, agentId: string, event: string, data: any): void {
    // Find socket for specific agent
    const session = this.sessions.get(sessionId);
    if (!session || !session.agents.has(agentId)) return;
    
    this.io.to(sessionId).emit(event, {
      targetAgent: agentId,
      ...data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get comprehensive statistics
   */
  getStats(): {
    environment: string;
    activeSessions: number;
    connectedClients: number;
    totalAgents: number;
    activeStreams: number;
    totalTasks: number;
    completedTasks: number;
    errorRate: number;
    avgExecutionTime: number;
    uptime: number;
  } {
    const totalTasks = Array.from(this.sessions.values()).reduce((sum, s) => sum + s.metrics.totalTasks, 0);
    const completedTasks = Array.from(this.sessions.values()).reduce((sum, s) => sum + s.metrics.completedTasks, 0);
    const errorCount = Array.from(this.sessions.values()).reduce((sum, s) => sum + s.metrics.errorCount, 0);
    const avgExecutionTime = Array.from(this.sessions.values()).reduce((sum, s) => sum + s.metrics.avgExecutionTime, 0) / this.sessions.size;
    const totalAgents = Array.from(this.sessions.values()).reduce((sum, s) => sum + s.agents.size, 0);
    const activeStreams = Array.from(this.sessions.values()).reduce((sum, s) => sum + s.activeStreams.size, 0);
    
    return {
      environment: Environment.current(),
      activeSessions: this.sessions.size,
      connectedClients: this.connectedClients.size,
      totalAgents,
      activeStreams,
      totalTasks,
      completedTasks,
      errorRate: totalTasks > 0 ? (errorCount / totalTasks) * 100 : 0,
      avgExecutionTime: avgExecutionTime || 0,
      uptime: Date.now() - this.startTime
    };
  }
  
  private startTime: number = Date.now();
  
  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down BrolostackWSMultiagent');
    
    // Notify all clients
    this.io.emit('server-shutdown', {
      message: 'Server is shutting down',
      timestamp: Date.now()
    });
    
    // Close all connections
    this.io.close();
    
    // Clear sessions
    this.sessions.clear();
    this.connectedClients.clear();
    
    this.emit('shutdown-complete');
  }
}
