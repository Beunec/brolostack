# Brolostack Examples

This directory contains comprehensive example applications demonstrating the power and versatility of the Brolostack framework. Each example showcases different use cases and implementation patterns.

## Available Examples

### 1. Personal App Project
**Location**: `personal-app/`  
**Port**: 3001  
**Description**: A personal todo management application demonstrating basic CRUD operations and local data persistence.

**Features**:
- Todo item management
- Task completion tracking
- Local data persistence
- Simple, clean interface

**Use Cases**:
- Personal productivity
- Task management
- Learning Brolostack basics

### 2. Enterprise App Project
**Location**: `enterprise-app/`  
**Port**: 3002  
**Description**: A comprehensive project management application for enterprise environments.

**Features**:
- Project management
- Task assignment and tracking
- Team member management
- Progress monitoring
- Advanced data relationships

**Use Cases**:
- Enterprise project management
- Team collaboration
- Complex data structures

### 3. AI-Ready Project
**Location**: `ai-ready-app/`  
**Port**: 3003  
**Description**: A chat application with AI integration capabilities, demonstrating Brolostack's AI-ready architecture.

**Features**:
- Chat interface
- AI agent integration
- Memory management
- Real-time messaging simulation
- AI context handling

**Use Cases**:
- AI-powered applications
- Chat interfaces
- Multi-agent systems
- AI memory management

### 4. College Research Project
**Location**: `college-research-app/`  
**Port**: 3004  
**Description**: A research management application for college students and academics.

**Features**:
- Research project tracking
- Academic subject organization
- Priority management
- Due date tracking
- Statistics dashboard
- Tag system

**Use Cases**:
- Academic research
- Thesis management
- Course projects
- Publication tracking

### 5. SaaS App Project
**Location**: `saas-app/`  
**Port**: 3005  
**Description**: A Software-as-a-Service management dashboard for SaaS businesses.

**Features**:
- Customer management
- Subscription tracking
- Revenue analytics
- Plan management
- Business metrics
- Customer lifecycle tracking

**Use Cases**:
- SaaS business management
- Customer relationship management
- Revenue tracking
- Business analytics

### 6. Private Mode Example - **NEW**
**Location**: `private-mode-example/`  
**Port**: 3006  
**Description**: Demonstrates Brolostack's comprehensive private mode support across all browsers, including DuckDuckGo browser support.

**Features**:
- Universal private mode detection
- Storage fallback mechanisms
- DuckDuckGo browser support
- Real-time privacy status display
- Data export/import in private mode
- Browser compatibility testing

**Use Cases**:
- Privacy-focused applications
- Browser compatibility testing
- Private mode development
- DuckDuckGo integration
- Privacy-first design patterns

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

### Running Examples

1. **Navigate to any example directory**:
   ```bash
   cd examples/[example-name]
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to the specified port

### Example Ports

- Personal App: `http://localhost:3001`
- Enterprise App: `http://localhost:3002`
- AI-Ready App: `http://localhost:3003`
- College Research: `http://localhost:3004`
- SaaS App: `http://localhost:3005`
- Private Mode Example: `http://localhost:3006`

## Common Patterns

### Store Management
All examples demonstrate Brolostack's store management:

```typescript
// Create a store
const store = app.createStore('store-name', initialState);

// Add custom methods
store.addMethod('methodName', (data) => {
  // Custom logic
});

// Persist data
store.persist();
```

### React Integration
Examples show how to integrate Brolostack with React:

```typescript
// Use Brolostack provider
<BrolostackProvider appName="my-app" config={{}}>
  <App />
</BrolostackProvider>

// Access stores in components
const store = useBrolostackStore('store-name');
const state = useBrolostackState('store-name', selector);
```

### Data Persistence
All examples demonstrate local data persistence:

```typescript
// Data automatically persists to browser storage
// No server required - everything runs locally
```

## Learning Path

### Beginner
1. Start with **Personal App** to understand basic concepts
2. Explore **College Research** for more complex data structures

### Intermediate
3. Study **Enterprise App** for advanced patterns
4. Examine **SaaS App** for business logic

### Advanced
5. Dive into **AI-Ready App** for AI integration patterns
6. Explore **Private Mode Example** for privacy and browser compatibility

## Customization

Each example can be customized by modifying:

- **`src/App.tsx`**: Main application logic
- **`src/App.css`**: Styling and design
- **`src/main.tsx`**: Brolostack configuration
- **`package.json`**: Dependencies and scripts

## Key Benefits Demonstrated

### Zero-Cost Deployment
- No server infrastructure required
- No database hosting costs
- No cloud service fees

### Local Data Storage
- Data stored in user's browser
- Infinite storage (limited by device)
- Complete privacy and security

### Fast Performance
- Near-instantaneous load times
- Local data access
- No network latency

### Simplified Development
- Focus on application logic
- No server-side complexity
- Easy deployment to static hosts

## Contributing

To add new examples:

1. Create a new directory in `examples/`
2. Follow the existing structure and patterns
3. Add a comprehensive README
4. Update this main README
5. Test thoroughly

## Support

For questions about the examples or Brolostack framework:

- Check the main Brolostack documentation
- Review the source code in each example
- Examine the implementation patterns
- Test and modify the examples

## License

All examples are released under the MIT License, same as the main Brolostack framework.
