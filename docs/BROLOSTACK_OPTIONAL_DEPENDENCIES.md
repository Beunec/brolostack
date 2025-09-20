# Brolostack Optional Dependencies

## 🎯 **Framework Design Philosophy**

Brolostack is designed as a **zero-dependency core framework** with **optional enhancements**. This means:

- ✅ **Core functionality works without any external dependencies**
- ✅ **Enhanced features require specific optional dependencies**
- ✅ **Graceful degradation when dependencies are missing**
- ✅ **Clear error messages guide developers to install needed packages**

## 📦 **Optional Dependencies by Feature**

### **🚀 WebSocket Features**

#### **BrolostackWSMultiagent** (Server-side)
```bash
# Required for multi-agent WebSocket server
npm install socket.io

# Optional for enhanced middleware
npm install cors helmet compression
```

#### **BrolostackWSClientside** (Client-side)
```bash
# Required for enhanced WebSocket client
npm install socket.io-client

# Automatically falls back to native WebSocket if not available
```

### **🔧 Backend Integrations**

#### **Express Integration**
```bash
# Required
npm install express cors

# Optional enhancements
npm install helmet compression morgan
```

#### **NestJS Integration**
```bash
# Required
npm install @nestjs/core @nestjs/websockets @nestjs/platform-socket.io

# Optional
npm install @nestjs/throttler
```

#### **FastAPI Integration** (Python)
```bash
# Required
pip install fastapi python-socketio uvicorn

# Optional
pip install redis databases
```

## 🔄 **Graceful Fallback Behavior**

### **When Dependencies Are Missing**

```typescript
// BrolostackWSMultiagent graceful fallback
try {
  const wsMultiAgent = new BrolostackWSMultiagent(server);
  // Full multi-agent functionality available
} catch (error) {
  console.warn('Socket.IO not available. Install with: npm install socket.io');
  // Falls back to basic WebSocket functionality
  const basicWS = new WebSocketManager(config);
}
```

### **Client-side Fallback**

```typescript
// BrolostackWSClientside graceful fallback
const wsClient = new BrolostackWSClientside({
  url: 'wss://your-server.com'
});

// If socket.io-client is not available:
// - Falls back to native WebSocket
// - Maintains basic real-time functionality
// - Logs helpful installation message
```

## 🎯 **Installation Recommendations**

### **For Basic Usage** (No WebSocket)
```bash
npm install brolostack
# Core functionality works immediately
```

### **For WebSocket Client Features**
```bash
npm install brolostack socket.io-client
# Enables BrolostackWSClientside and React hooks
```

### **For WebSocket Server Features**
```bash
npm install brolostack socket.io cors
# Enables BrolostackWSMultiagent and ARGS protocol
```

### **For Full Enterprise Features**
```bash
npm install brolostack socket.io socket.io-client cors helmet compression
# Enables all WebSocket features with security enhancements
```

## 🛡️ **Security Considerations**

### **Production Recommendations**

```bash
# Essential for production WebSocket servers
npm install helmet compression rate-limiter-flexible

# For enhanced security
npm install express-rate-limit express-slow-down
```

### **Environment-Specific Dependencies**

```json
{
  "dependencies": {
    "brolostack": "^1.0.2"
  },
  "optionalDependencies": {
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "morgan": "^1.10.0"
  }
}
```

## 🔧 **Framework Behavior**

### **Automatic Dependency Detection**

Brolostack automatically detects available dependencies and enables features accordingly:

```typescript
// Framework automatically detects and configures
const app = new Brolostack({
  appName: 'my-app',
  enterprise: {
    realtime: {
      enabled: true // Auto-detects socket.io availability
    }
  }
});

// If socket.io is available:
// ✅ Full multi-agent WebSocket support
// ✅ ARGS protocol enabled
// ✅ Advanced room management

// If socket.io is NOT available:
// ✅ Basic WebSocket functionality
// ✅ Helpful installation messages
// ✅ Graceful feature degradation
```

### **Error Messages and Guidance**

When optional dependencies are missing, Brolostack provides helpful guidance:

```
⚠️  Socket.IO not found
💡 Install with: npm install socket.io
📖 See: https://brolostack.dev/docs/websocket-setup

⚠️  CORS middleware not available  
💡 Install with: npm install cors
📖 See: https://brolostack.dev/docs/cors-setup
```

## 📊 **Dependency Matrix**

| Feature | Core | socket.io | socket.io-client | cors | helmet |
|---------|------|-----------|------------------|------|--------|
| **Basic Brolostack** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **WebSocket Client** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Multi-Agent Server** | ✅ | ✅ | ❌ | ⚠️ | ⚠️ |
| **Full WebSocket** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ Required
- ⚠️ Recommended for production
- ❌ Not needed

## 🎉 **Benefits of This Approach**

### **✅ For Framework Users**
- **Lightweight**: Install only what you need
- **Flexible**: Choose your dependencies
- **Progressive**: Add features as you grow
- **Clear**: Explicit about what each feature requires

### **✅ For Framework Maintainers**  
- **Modular**: Each feature is self-contained
- **Testable**: Core functionality always works
- **Maintainable**: Dependencies are isolated
- **Scalable**: Easy to add new optional features

## 🚀 **Quick Start Examples**

### **Minimal Setup** (No WebSocket)
```bash
npm install brolostack
```
```typescript
import { Brolostack } from 'brolostack';
const app = new Brolostack({ appName: 'my-app' });
// ✅ Storage, API, AI features work immediately
```

### **WebSocket Client Setup**
```bash
npm install brolostack socket.io-client
```
```typescript
import { useBrolostackWebSocket } from 'brolostack';
const { ws, connected } = useBrolostackWebSocket();
// ✅ Full client-side WebSocket functionality
```

### **Full WebSocket Server Setup**
```bash
npm install brolostack socket.io cors
```
```typescript
import { BrolostackWSMultiagent } from 'brolostack';
const wsServer = new BrolostackWSMultiagent(httpServer);
// ✅ Complete multi-agent server functionality
```

This approach ensures Brolostack remains **lightweight and flexible** while providing **powerful optional enhancements** when needed.
