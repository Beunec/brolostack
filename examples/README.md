# 🔥 Brolostack Examples

This directory contains comprehensive examples demonstrating the Brolostack framework and the revolutionary Devil security system.

## 📁 Example Projects

### 1. 🔥 Devil Security Showcase (`devil-security-showcase/`)
Basic demonstration of the Brolostack Devil security framework features:
- Zero-knowledge data encryption
- AI conversation protection
- Browser storage protection
- Real-time security monitoring

### 2. 🔥 Devil Complete Showcase (`devil-complete-showcase/`)
Comprehensive demonstration including:
- All Devil security features
- Source code protection for all file types
- Build system integration
- Backend framework examples (Node.js, Python)
- Multi-language support (JS, TS, HTML, PHP, CSS)

### 3. 🌐 WebSocket Showcase (`websocket-showcase/`)
Real-time communication examples:
- Multi-agent WebSocket communication
- ARGS Protocol implementation
- Client-side real-time features
- Backend integrations

### 4. 🏢 Enterprise Multi-Provider (`enterprise-multi-provider/`)
Enterprise features demonstration:
- Multi-cloud provider integration
- Advanced authentication
- Enterprise-grade security
- Production-ready configurations

### 5. 🌍 Environment Showcase (`environment-showcase/`)
Environment management examples:
- Development/staging/production configurations
- Automatic environment detection
- Performance optimizations

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure you have Node.js 18+ installed
node --version  # Should be 18+

# For Python examples
python --version  # Should be 3.8+
```

### Running Examples

#### Option 1: Use Local Development Setup
```bash
# From the main brolostack directory
cd /Users/beunec/Documents/brolostack

# Install main dependencies
npm install

# Run the main build to ensure everything works
npm run build

# Navigate to any example
cd examples/devil-complete-showcase

# Follow the README in that directory
```

#### Option 2: Install Brolostack Package (Production)
```bash
# In a new project
npm install brolostack

# Then use imports like:
import { 
  BrolostackProvider,
  BrolostackDevilProvider,
  Devil,
  DevilSourceCode 
} from 'brolostack';
```

## 📝 Import Patterns

### In Examples (Local Development)
```typescript
// Examples use local imports for development
import { BrolostackProvider } from '../../../src/react/BrolostackProvider';
import { BrolostackDevilProvider } from '../../../src/react/BrolostackDevilProvider';
import { Devil } from '../../../src/security/BrolostackDevil';
```

### In Real Projects (Production)
```typescript
// Real projects use the published package
import { 
  BrolostackProvider,
  BrolostackDevilProvider,
  Devil,
  DevilSourceCode 
} from 'brolostack';
```

## 🔧 Configuration

### Development Environment
```typescript
// Lower protection for faster development
{
  protectionLevel: 'advanced',
  mutationInterval: 30000,
  browserProtection: { detectDevTools: false }
}
```

### Production Environment
```typescript
// Maximum protection for production
{
  protectionLevel: 'quantum-proof',
  mutationInterval: 1000,
  browserProtection: { detectDevTools: true }
}
```

## 🔥 Key Features Demonstrated

### 🔐 Data Protection
- **Zero-Knowledge Encryption**: User data inaccessible to developers
- **Cloud Storage Protection**: Providers store encrypted jargon
- **Browser Storage Protection**: localStorage/sessionStorage encrypted
- **AI Conversation Protection**: Providers see only meaningless jargon

### 🎭 Source Code Protection
- **JavaScript/TypeScript**: Complete variable/function obfuscation
- **HTML**: Attribute and embedded script/style protection
- **PHP**: Server-side logic completely scrambled
- **CSS**: Selector and variable name obfuscation
- **Python**: Variable/function/class name scrambling

### 🔧 Build Integration
- **Webpack Plugin**: Automatic protection during builds
- **Vite Plugin**: Modern bundler integration
- **Rollup Plugin**: Library build protection
- **Next.js Plugin**: Seamless React integration
- **CLI Tool**: Standalone file protection

### 🌐 Framework Support
- **Frontend**: React, Vue, Angular, Svelte
- **Backend**: Node.js, Python, PHP
- **Build Tools**: All major bundlers
- **Databases**: SQL and NoSQL support

## 🛠️ Troubleshooting

### Common Issues

**Q: Module resolution errors in examples**
A: Examples use local imports for development. In production, use `import from 'brolostack'`

**Q: TypeScript errors about missing modules**
A: Install peer dependencies: `npm install react react-dom typescript`

**Q: Build errors in examples**
A: Run `npm run build` in the main brolostack directory first

**Q: DevTools detection too aggressive**
A: Set `browserProtection.detectDevTools: false` in development

## 📚 Documentation

- [Main Documentation](../docs/)
- [Devil Security Framework](../docs/DEVIL_SECURITY_FRAMEWORK.md)
- [WebSocket Framework](../docs/WEBSOCKET_FRAMEWORK.md)
- [Environment Management](../docs/ENVIRONMENT_MANAGEMENT.md)
- [Complete Summary](../docs/DEVIL_COMPLETE_SUMMARY.md)

## 🤝 Contributing

1. **Report Issues**: Help us find and fix problems
2. **Improve Examples**: Add new use cases and scenarios
3. **Write Documentation**: Improve guides and tutorials
4. **Add Features**: Contribute new protection techniques

## 📄 License

MIT License - Use responsibly and ethically.

---

**🔥 THE DEVIL IS WATCHING... YOUR CODE IS PROTECTED! 🔥**