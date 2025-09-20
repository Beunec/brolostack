/**
 * Brolostack WebSocket Express Server Example
 * Demonstrates multi-agent WebSocket integration with Express
 */

const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const { BrolostackWSMultiagent, Environment } = require('brolostack');

// Initialize Express app
const app = express();
const server = createServer(app);

// Environment-aware configuration
const config = {
  port: process.env.PORT || 3001,
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? true 
      : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  websocket: {
    cors: {
      origin: process.env.NODE_ENV === 'development' 
        ? true 
        : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST']
    },
    compression: process.env.NODE_ENV === 'production',
    rateLimiting: {
      enabled: process.env.NODE_ENV === 'production',
      maxRequestsPerMinute: 1000,
      maxConcurrentTasks: 50
    },
    security: {
      enableAuth: process.env.NODE_ENV === 'production',
      apiKeyRequired: process.env.NODE_ENV === 'production',
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || []
    },
    agents: {
      maxAgentsPerSession: 20,
      taskTimeout: 300000, // 5 minutes
      collaborationTimeout: 60000, // 1 minute
      autoCleanupInterval: 300000 // 5 minutes
    }
  }
};

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.cors));

// Environment-aware logging
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Initialize Brolostack WebSocket Multi-Agent
const wsMultiAgent = new BrolostackWSMultiagent(server, config.websocket);

// REST API endpoints for WebSocket management
app.get('/api/ws/stats', (req, res) => {
  const stats = wsMultiAgent.getStats();
  res.json({
    ...stats,
    server: 'express',
    timestamp: Date.now()
  });
});

app.get('/api/ws/sessions', (req, res) => {
  const sessions = wsMultiAgent.getActiveSessions();
  res.json({
    count: sessions.size,
    sessions: Array.from(sessions.keys()),
    details: Array.from(sessions.values()).map(session => ({
      sessionId: session.sessionId,
      agentCount: session.agents.size,
      taskCount: session.tasks.size,
      status: session.status,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    }))
  });
});

app.post('/api/ws/broadcast', (req, res) => {
  const { event, data, sessionId } = req.body;
  
  if (sessionId) {
    wsMultiAgent.broadcastToSession(sessionId, event, data);
  } else {
    // Broadcast to all sessions
    const sessions = wsMultiAgent.getActiveSessions();
    for (const session of sessions.keys()) {
      wsMultiAgent.broadcastToSession(session, event, data);
    }
  }
  
  res.json({ 
    status: 'sent', 
    timestamp: Date.now(),
    targetSessions: sessionId ? 1 : wsMultiAgent.getActiveSessions().size
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    framework: 'express',
    websocket: 'active',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Demo endpoints for testing
app.get('/api/demo/agents', (req, res) => {
  res.json({
    availableAgentTypes: [
      'data-processor',
      'ml-analyzer', 
      'text-generator',
      'image-processor',
      'audio-analyzer',
      'video-processor'
    ],
    capabilities: [
      'data-analysis',
      'machine-learning',
      'natural-language-processing',
      'computer-vision',
      'speech-recognition',
      'text-generation',
      'image-generation',
      'video-processing'
    ]
  });
});

app.post('/api/demo/simulate-agent', (req, res) => {
  const { sessionId, agentType, taskType } = req.body;
  
  // Simulate agent registration and task execution
  setTimeout(() => {
    wsMultiAgent.broadcastToSession(sessionId, 'agent-registered', {
      sessionId,
      agent: {
        id: `demo-agent-${Date.now()}`,
        type: agentType || 'data-processor',
        capabilities: ['data-analysis', 'visualization'],
        status: 'idle',
        metadata: {
          name: 'Demo Agent',
          version: '1.0.0',
          maxConcurrentTasks: 3,
          currentTasks: 0
        }
      },
      timestamp: Date.now()
    });
  }, 1000);
  
  // Simulate task progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 20;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      
      wsMultiAgent.broadcastToSession(sessionId, 'task-completed', {
        taskId: `demo-task-${Date.now()}`,
        result: {
          status: 'success',
          output: 'Task completed successfully',
          executionTime: Math.random() * 10000
        },
        timestamp: Date.now()
      });
    } else {
      wsMultiAgent.broadcastToSession(sessionId, 'task-progress', {
        sessionId,
        progress: {
          agentId: `demo-agent-${Date.now()}`,
          taskId: `demo-task-${Date.now()}`,
          step: `Processing step ${Math.floor(progress / 20) + 1}`,
          status: 'processing',
          progress: Math.floor(progress),
          message: `${Math.floor(progress)}% complete`,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      });
    }
  }, 2000);
  
  res.json({ 
    status: 'simulation-started',
    sessionId,
    agentType,
    taskType
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  
  const errorResponse = {
    error: 'Internal Server Error',
    timestamp: Date.now()
  };
  
  // Show detailed errors only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = err.message;
    errorResponse.stack = err.stack;
  }
  
  res.status(500).json(errorResponse);
});

// Start server
server.listen(config.port, () => {
  console.log(`
🚀 Brolostack WebSocket Express Server Started!

Environment: ${process.env.NODE_ENV || 'development'}
Port: ${config.port}
WebSocket Path: /brolostack-multiagent
ARGS Protocol: Enabled
Multi-Agent Support: Active

API Endpoints:
- GET  /health              - Health check
- GET  /api/ws/stats        - WebSocket statistics  
- GET  /api/ws/sessions     - Active sessions
- POST /api/ws/broadcast    - Broadcast message
- GET  /api/demo/agents     - Available agent types
- POST /api/demo/simulate-agent - Simulate agent activity

WebSocket Events:
- join-session              - Join a multi-agent session
- register-agent            - Register an AI agent
- start-task               - Start a collaborative task
- agent-progress           - Send progress updates
- collaboration-request    - Request agent collaboration

Ready for connections! 🎉
`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  
  await wsMultiAgent.shutdown();
  
  server.close(() => {
    console.log('✅ Server shut down successfully');
    process.exit(0);
  });
});

module.exports = { app, server, wsMultiAgent };
