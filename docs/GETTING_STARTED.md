# Getting Started with Brolostack

**Build full-stack apps with zero server costs** - Brolostack runs entirely in the user's browser with optional cloud integration.

## Quick Install

```bash
npm install brolostack
```

## 5-Minute Setup

### 1. Initialize Brolostack

```typescript
import { Brolostack } from 'brolostack';

const app = new Brolostack({
  appName: 'my-app',
  version: '1.0.2'
});

await app.initialize();
```

### 2. Create Your First Store

```typescript
const todoStore = app.createStore('todos', {
  todos: [],
  addTodo: (text) => set(state => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  toggleTodo: (id) => set(state => ({
    todos: state.todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  }))
});
```

### 3. Use Your Data

```typescript
// Get data
const todos = todoStore.getState().todos;

// Update data
todoStore.addTodo('Learn Brolostack');

// Subscribe to changes
todoStore.subscribe((state) => {
  console.log('Todos:', state.todos);
});
```

## React Integration

### Setup Provider

```typescript
import { BrolostackProvider } from 'brolostack/react';

function App() {
  return (
    <BrolostackProvider appName="my-app">
      <TodoApp />
    </BrolostackProvider>
  );
}
```

### Use in Components

```typescript
import { useBrolostack } from 'brolostack/react';

function TodoApp() {
  const { stores } = useBrolostack();
  const todoStore = stores.get('todos');
  const todos = todoStore.useStore(state => state.todos);
  const addTodo = todoStore.useStore(state => state.addTodo);

  return (
    <div>
      <input 
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            addTodo(e.target.value);
            e.target.value = '';
          }
        }}
        placeholder="Add todo..."
      />
      {todos.map(todo => (
        <div key={todo.id}>
          <input 
            type="checkbox" 
            checked={todo.done}
            onChange={() => todoStore.toggleTodo(todo.id)}
          />
          {todo.text}
        </div>
      ))}
    </div>
  );
}
```

## AI Integration

Brolostack includes comprehensive AI capabilities with multiple providers and governance.

### Basic AI Usage

```typescript
// Create AI agent
const aiAgent = app.ai.createAgent({
  name: 'assistant',
  type: 'chat',
  config: { model: 'gpt-4', temperature: 0.7 }
});

// Store AI memory
await app.ai.storeMemory('user_preferences', {
  theme: 'dark',
  language: 'en'
}, 'preference');

// Use AI with context
const response = await app.ai.runAgent('assistant', {
  prompt: 'Help me organize my tasks',
  context: { todos: todoStore.getState().todos }
});
```

### Advanced AI Framework

```typescript
import { BrolostackAIFramework } from 'brolostack';

const aiFramework = new BrolostackAIFramework({
  provider: {
    name: 'openai',
    apiKey: 'your-api-key',
    model: 'gpt-4'
  },
  reasoning: { framework: 'cot' }, // Chain-of-Thought
  governance: {
    enabled: true,
    config: {
      hallucination: { enabled: true },
      toxicLanguage: { enabled: true },
      bias: { enabled: true }
    }
  }
});

// AI with reasoning and safety
const result = await aiFramework.processQuery('Analyze this data', {
  data: todoStore.getState().todos
});
```

## Data Persistence

### Auto-Save (Recommended)

```typescript
// Enable auto-persistence
todoStore.persist({
  name: 'todos-storage',
  partialize: (state) => ({ todos: state.todos })
});
```

### Manual Export/Import

```typescript
// Export data
const data = await app.exportData();

// Import data
await app.importData(data);
```

## Cloud Integration (Optional)

Brolostack supports 22+ cloud providers for optional data synchronization and backup.

### Basic Cloud Setup

```typescript
import { CloudBrolostack } from 'brolostack';

const cloudApp = new CloudBrolostack({
  appName: 'my-cloud-app',
  version: '1.0.2',
  cloud: {
    enabled: true,
    adapters: [
      {
        name: 'aws',
        provider: 'aws',
        config: {
          region: 'us-east-1',
          accessKeyId: 'your-key',
          secretAccessKey: 'your-secret'
        },
        enabled: true
      }
    ],
    syncStrategy: 'local-first',
    conflictResolution: 'client-wins'
  }
});
```

### Multi-Cloud Configuration

```typescript
const multiCloudApp = new CloudBrolostack({
  appName: 'multi-cloud-app',
  version: '1.0.2',
  cloud: {
    enabled: true,
    adapters: [
      {
        name: 'mongodb',
        provider: 'mongodb',
        config: { connectionString: 'mongodb://...' },
        enabled: true,
        priority: 1
      },
      {
        name: 'redis',
        provider: 'redis',
        config: { host: 'redis.example.com' },
        enabled: true,
        priority: 2
      }
    ],
    syncStrategy: 'hybrid',
    autoSync: true,
    syncInterval: 60000 // 1 minute
  }
});
```

## Key Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Store** | Data container with state and actions | `app.createStore('users', {...})` |
| **State** | Current data in a store | `store.getState()` |
| **Actions** | Functions that modify state | `store.addUser(user)` |
| **Persistence** | Auto-save to browser storage | `store.persist({...})` |
| **AI Memory** | Persistent AI context | `app.ai.storeMemory(...)` |
| **Cloud Adapters** | Optional cloud service integration | `CloudBrolostack with adapters` |
| **WebSocket** | Real-time communication | `BrolostackWSClientside` |
| **Security** | Zero-knowledge encryption | `BrolostackDevil` |
| **Authentication** | CIAM and multi-provider auth | `AuthManager` |

## Best Practices

### ✅ Do
- Use descriptive store names (`'user-preferences'` not `'data'`)
- Keep stores focused on single domains
- Enable persistence for important data
- Use TypeScript for better development experience

### ❌ Don't
- Store sensitive data without encryption
- Create too many small stores
- Forget to handle storage errors
- Mix UI state with business logic

## Common Patterns

### User Preferences Store

```typescript
const prefsStore = app.createStore('preferences', {
  theme: 'light',
  language: 'en',
  notifications: true,
  
  setTheme: (theme) => set(state => ({ ...state, theme })),
  setLanguage: (lang) => set(state => ({ ...state, language: lang })),
  toggleNotifications: () => set(state => ({ 
    ...state, 
    notifications: !state.notifications 
  }))
});
```

### API-like Operations

```typescript
// REST-like local API
const users = await app.api.get('/storage/users');
await app.api.post('/storage/users', { name: 'John' });
await app.api.put('/storage/users/1', { name: 'Jane' });
await app.api.delete('/storage/users/1');
```

## Troubleshooting

### Storage Issues
```typescript
// Check storage availability
const isAvailable = await app.storage.isAvailable();
console.log('Storage available:', isAvailable);

// Get storage stats
const stats = await app.storage.getStats();
console.log('Storage stats:', stats);
```

### Debug Mode
```typescript
const app = new Brolostack({
  appName: 'my-app',
  debug: true // Enable detailed logging
});
```

## Advanced Features

### Security with Devil Framework

```typescript
import { BrolostackDevil } from 'brolostack';

const devil = new BrolostackDevil({
  encryptionLevel: 'quantum-resistant',
  selfEvolving: true,
  sourceCodeProtection: true
});

// Encrypt sensitive data
const encrypted = await devil.encryptData(sensitiveData, 'user-key');
```

### Real-Time Communication

```typescript
import { BrolostackWSClientside } from 'brolostack';

const ws = new BrolostackWSClientside({
  url: 'wss://your-server.com',
  autoConnect: true
});

ws.joinRoom('collaboration-room');
ws.send('message', { content: 'Hello World!' });
```

### Multi-Provider Authentication

```typescript
import { AuthManager } from 'brolostack';

const auth = new AuthManager({
  ciam: {
    enabled: true,
    providers: ['auth0', 'microsoft-entra'],
    primaryProvider: 'auth0'
  }
});

const session = await auth.ciamLogin('auth0', { email, password });
```

## Next Steps

1. **Explore Examples**: Check out `/examples` for complete applications
2. **Read Documentation**: See specialized docs for advanced features
3. **Join Community**: [GitHub Discussions](https://github.com/Beunec/brolostack/discussions)
4. **Get Support**: [GitHub Issues](https://github.com/Beunec/brolostack/issues)
5. **Learn Advanced**: Check out AI Framework, Security, and WebSocket guides

---

**That's it!** You're ready to build zero-cost, full-stack applications with Brolostack. 🚀