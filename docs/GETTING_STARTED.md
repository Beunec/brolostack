# Getting Started with Brolostack

**Build full-stack apps with zero server costs** - Brolostack runs entirely in the user's browser.

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
  version: '1.0.0'
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

### Create AI Agent

```typescript
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

// Use AI
const response = await app.ai.runAgent('assistant', {
  prompt: 'Help me organize my tasks',
  context: { todos: todoStore.getState().todos }
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

```typescript
import { CloudBrolostack } from 'brolostack/cloud';

const cloudApp = new CloudBrolostack({
  appName: 'my-cloud-app',
  cloud: {
    provider: 'aws',
    config: { region: 'us-east-1', bucket: 'my-data' },
    autoSync: true
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

## Next Steps

1. **Explore Examples**: Check out `/examples` for complete apps
2. **Read API Docs**: See [API Reference](API_REFERENCE.md) for full details
3. **Join Community**: [GitHub Discussions](https://github.com/Beunec/brolostack/discussions)
4. **Get Support**: [GitHub Issues](https://github.com/Beunec/brolostack/issues)

---

**That's it!** You're ready to build zero-cost, full-stack applications with Brolostack. 🚀