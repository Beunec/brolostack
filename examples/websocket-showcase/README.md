# Brolostack WebSocket Showcase

## 🚀 Revolutionary WebSocket Framework

This example demonstrates Brolostack's revolutionary WebSocket capabilities:

- **BrolostackWSMultiagent** - Multi-agent collaboration with ARGS Protocol
- **BrolostackWSClientside** - Enhanced client-side WebSocket communication
- **Environment-aware configurations** - Automatic optimization for dev/staging/production
- **Backend integrations** - Seamless Node.js and Python framework support

## 🌟 Key Features

### ✅ **ARGS Protocol Integration**
- Agent Real-time Governance & Streaming
- Standardized multi-agent communication
- Task coordination and collaboration
- Real-time progress streaming

### ✅ **Environment Awareness**
- Development: Full debugging, verbose logging
- Staging: Production-like with monitoring
- Production: Optimized performance and security

### ✅ **Backend Compatibility**
- **Node.js**: Express, NestJS, Fastify, Koa
- **Python**: FastAPI, Django, Flask, Tornado

### ✅ **Enterprise Features**
- Automatic reconnection with exponential backoff
- Message queuing and offline support
- Performance monitoring and metrics
- Security and authentication

## 🏗️ **Project Structure**

```
websocket-showcase/
├── client/                 # React client example
│   ├── src/
│   │   ├── App.tsx        # Main application
│   │   ├── MultiAgent.tsx # Multi-agent demo
│   │   └── ClientSide.tsx # Client-side demo
│   └── package.json
├── server/
│   ├── nodejs/            # Node.js server examples
│   │   ├── express.js     # Express integration
│   │   ├── nestjs.js      # NestJS integration
│   │   └── fastify.js     # Fastify integration
│   └── python/            # Python server examples
│       ├── fastapi_server.py    # FastAPI integration
│       ├── django_server.py     # Django integration
│       └── flask_server.py      # Flask integration
└── README.md
```

## 🚀 **Quick Start**

### 1. **Install Dependencies**

```bash
# Client dependencies
cd client && npm install

# Server dependencies (Node.js)
cd server/nodejs && npm install

# Server dependencies (Python)
cd server/python && pip install -r requirements.txt
```

### 2. **Start Server (Choose Your Backend)**

#### Node.js + Express
```bash
cd server/nodejs
NODE_ENV=development node express.js
```

#### Python + FastAPI
```bash
cd server/python
ENVIRONMENT=development python fastapi_server.py
```

### 3. **Start Client**

```bash
cd client
npm start
```

## 🎯 **Usage Examples**

### **Multi-Agent Collaboration**

```typescript
import { BrolostackWSMultiagent } from 'brolostack';
import { createServer } from 'http';

const server = createServer();
const wsMultiAgent = new BrolostackWSMultiagent(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? true : process.env.ALLOWED_ORIGINS?.split(','),
    methods: ['GET', 'POST']
  },
  agents: {
    maxAgentsPerSession: 10,
    taskTimeout: 300000,
    collaborationTimeout: 60000
  }
});

server.listen(3001, () => {
  console.log('Multi-agent WebSocket server running on port 3001');
});
```

### **Client-Side Integration**

```typescript
import { BrolostackWSClientside } from 'brolostack';

const wsClient = new BrolostackWSClientside({
  url: 'http://localhost:3001',
  autoConnect: true,
  messageQueue: {
    enabled: true,
    maxSize: 100,
    persistOffline: true
  }
});

// Join a collaboration session
await wsClient.connect();
wsClient.joinRoom('agent-session-1', 'AI Collaboration Room');

// Send agent registration
wsClient.send('register-agent', {
  id: 'frontend-agent-1',
  type: 'ui-coordinator',
  capabilities: ['user-interaction', 'data-visualization'],
  status: 'idle'
});
```

### **React Hook Integration**

```tsx
import { useBrolostackWebSocket } from 'brolostack';

function MultiAgentDashboard() {
  const { ws, connected, stats, joinRoom, send } = useBrolostackWebSocket({
    url: 'http://localhost:3001',
    autoConnect: true
  });

  const handleStartTask = () => {
    send('start-task', {
      id: 'task-1',
      type: 'data-analysis',
      requirements: {
        agentTypes: ['data-processor', 'ml-analyzer'],
        capabilities: ['data-processing', 'machine-learning']
      },
      collaborationMode: 'parallel'
    });
  };

  return (
    <div>
      <div>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <div>Environment: {stats?.environment}</div>
      <button onClick={handleStartTask}>Start Multi-Agent Task</button>
    </div>
  );
}
```

## 🔧 **Environment Configuration**

### **Development**
```bash
NODE_ENV=development
BROLOSTACK_ENV=development
WS_URL=http://localhost:3001
DEBUG=true
```

### **Production**
```bash
NODE_ENV=production
BROLOSTACK_ENV=production
WS_URL=wss://ws.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
API_KEY_REQUIRED=true
```

## 📊 **Features Demonstrated**

1. **Multi-Agent Task Coordination**
2. **Real-time Progress Streaming**
3. **Agent Collaboration Requests**
4. **Environment-aware Optimizations**
5. **Backend Framework Integration**
6. **Message Queuing and Offline Support**
7. **Performance Monitoring**
8. **Security and Authentication**

## 🎉 **Revolutionary Capabilities**

This showcase demonstrates how Brolostack makes WebSocket development:

- ✅ **Effortless** - One-line setup for complex functionality
- ✅ **Environment-aware** - Automatic optimization per environment
- ✅ **Backend-agnostic** - Works with any Node.js or Python framework
- ✅ **Enterprise-ready** - Production-grade security and performance
- ✅ **Developer-friendly** - Excellent TypeScript support and React hooks
