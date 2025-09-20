# Brolostack Environment Management

## 🌟 **Seamless Development, Testing, and Production Environments**

Brolostack provides **comprehensive environment management** that automatically optimizes your application based on the current environment. Switch between development, testing, staging, and production environments **seamlessly and smoothly** with zero configuration required.

## 🎯 **Key Features**

### ✅ **Automatic Environment Detection**
- Detects environment from `NODE_ENV` or `BROLOSTACK_ENV`
- Intelligent fallbacks and validation
- Zero configuration required

### ✅ **Environment-Specific Optimizations**
- **Development**: Maximum debugging, detailed errors, verbose logging
- **Testing**: Isolated storage, minimal logging, fast execution
- **Staging**: Production-like with enhanced monitoring
- **Production**: Maximum performance, security, and reliability

### ✅ **Performance Optimizations**
- **Minification**: Automatic in production/staging
- **Compression**: Environment-aware compression levels
- **Tree Shaking**: Removes unused code in production
- **Caching**: advanced caching strategies per environment
- **Lazy Loading**: Optimized loading patterns

### ✅ **Security Configurations**
- **Development**: Detailed errors, stack traces, permissive CORS
- **Production**: Secure headers, CSP policies, error suppression
- **Environment-aware authentication and encryption**

## 🚀 **Quick Start**

### Basic Usage

```typescript
import { Brolostack, Environment } from 'brolostack';

// Brolostack automatically detects and optimizes for current environment
const app = new Brolostack({
  appName: 'my-app',
  version 1.0.2'
  // Environment-specific settings applied automatically
});

// Check current environment
console.log(`Running in ${Environment.current()} mode`);

// Environment-specific behavior
if (Environment.isDev()) {
  console.log('Development mode - full debugging enabled');
} else if (Environment.isProd()) {
  console.log('Production mode - optimized for performance');
}
```

### Environment-Optimized Configuration

```typescript
import { EnvironmentUtils } from 'brolostack';

// Create environment-optimized configuration
const config = EnvironmentUtils.createEnvironmentConfig({
  appName: 'my-app',
  version 1.0.2',
  
  enterprise: {
    auth: {
      enabled: true,
      endpoints: {
        login: process.env.AUTH_LOGIN_URL
      }
    },
    
    cloud: {
      enabled: true,
      providers: [{
        name: 'aws',
        config: {
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        }
      }]
    }
  }
});

const app = new Brolostack(config);
```

## 🔧 **Environment Configuration**

### Setting Environment Variables

```bash
# Method 1: Using NODE_ENV (standard)
export NODE_ENV=production
npm start

# Method 2: Using BROLOSTACK_ENV (more specific)
export BROLOSTACK_ENV=staging
npm start

# Method 3: Inline
NODE_ENV=development npm start
BROLOSTACK_ENV=testing npm test
```

### Environment Hierarchy

1. **BROLOSTACK_ENV** (highest priority)
2. **NODE_ENV** (fallback)
3. **'development'** (default)

### Supported Environments

- **`development`** - Full debugging, detailed errors, permissive security
- **`testing`** - Isolated storage, minimal logging, fast execution
- **`staging`** - Production-like with enhanced monitoring
- **`production`** - Maximum performance, security, and reliability

## 📊 **Environment-Specific Configurations**

### Development Environment

```typescript
{
  debug: true,
  performance: {
    enableCaching: true,
    cacheStrategy: 'minimal',
    lazyLoading: true
  },
  security: {
    enableDetailedErrors: true,
    enableStackTraces: true,
    enableConsoleLogging: true,
    enableSourceMaps: true,
    enableCORS: true,
    corsOrigins: '*'
  },
  storage: {
    engine: 'localStorage',
    maxSize: 50, // MB
    persistentCache: true
  },
  api: {
    enableMocking: true,
    requestTimeout: 10000,
    retryAttempts: 3,
    enableRequestLogging: true
  }
}
```

### Production Environment

```typescript
{
  debug: false,
  performance: {
    enableMinification: true,
    enableCompression: true,
    enableTreeShaking: true,
    enableCaching: true,
    cacheStrategy: 'advanced',
    bundleOptimization: true,
    lazyLoading: true
  },
  security: {
    enableDetailedErrors: false,
    enableStackTraces: false,
    enableConsoleLogging: false,
    enableSourceMaps: false,
    enableCORS: true,
    corsOrigins: ['https://yourdomain.com'],
    enableCSP: true,
    cspPolicy: "default-src 'self'"
  },
  storage: {
    engine: 'indexedDB',
    encryption: true,
    compression: true,
    maxSize: 500, // MB
    persistentCache: true
  }
}
```

## 🛠️ **Advanced Usage**

### Environment-Aware Logging

```typescript
import { EnvironmentUtils } from 'brolostack';

// Logs only appear in development
EnvironmentUtils.log.debug('Debug information', { user: 'john' });

// Environment-aware logging
EnvironmentUtils.log.info('User logged in', { userId: 123 });

// Error handling with environment context
try {
  // Some operation
} catch (error) {
  EnvironmentUtils.handleError(error, {
    component: 'UserAuth',
    action: 'login',
    userId: 123
  });
}
```

### Performance Monitoring

```typescript
import { EnvironmentUtils } from 'brolostack';

// Automatic performance monitoring
const timer = new EnvironmentUtils.PerformanceTimer('Database Query');

// ... perform operation

timer.end({
  query: 'SELECT * FROM users',
  resultCount: 150
});
```

### Environment-Specific Features

```typescript
import { EnvironmentUtils } from 'brolostack';

// Check if features should be enabled
if (EnvironmentUtils.shouldEnable.analytics()) {
  // Enable analytics in production/staging
  initializeAnalytics();
}

if (EnvironmentUtils.shouldEnable.errorTracking()) {
  // Enable error tracking
  initializeErrorTracking();
}

if (EnvironmentUtils.shouldEnable.caching()) {
  // Enable caching
  const ttl = EnvironmentUtils.cache.getTTL();
  setupCache(ttl);
}
```

### Environment Validation

```typescript
import { EnvironmentUtils } from 'brolostack';

// Validate environment setup
const validation = EnvironmentUtils.validateEnvironment();

if (!validation.valid) {
  console.error('Environment validation failed:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Environment warnings:', validation.warnings);
}
```

## 🔒 **Security Per Environment**

### Development Security
- **Permissive CORS**: `origins: '*'`
- **Detailed Errors**: Full stack traces and error details
- **Source Maps**: Enabled for debugging
- **Console Logging**: Verbose logging enabled

### Production Security
- **Restrictive CORS**: Specific allowed origins
- **Error Suppression**: Generic error messages only
- **CSP Headers**: Content Security Policy enabled
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.

```typescript
// Get environment-specific security headers
const headers = EnvironmentUtils.getSecurityHeaders();
// In production: includes CSP, X-Frame-Options, etc.
// In development: minimal headers for easy debugging
```

## ⚡ **Performance Per Environment**

### Development Performance
- **Minimal Optimization**: Fast build times
- **Source Maps**: Enabled for debugging
- **Hot Reloading**: Supported
- **Caching**: Minimal for fresh reloads

### Production Performance
- **Maximum Optimization**: Minification, compression, tree shaking
- **advanced Caching**: Long-term caching strategies
- **Bundle Splitting**: Optimized loading
- **Lazy Loading**: Component-level lazy loading

```typescript
// Get environment-specific optimizations
const opts = EnvironmentUtils.buildOptimizations;

if (opts.shouldMinify()) {
  // Apply minification
}

if (opts.shouldCompress()) {
  const level = opts.getCompressionLevel(); // 1-9 based on environment
  // Apply compression
}
```

## 📱 **React Integration**

```tsx
import { BrolostackProvider, Environment } from 'brolostack';

function App() {
  return (
    <BrolostackProvider
      appName="my-app"
      config={{
        // Environment-specific config applied automatically
        version 1.0.2'
      }}
    >
      <div>
        {Environment.isDev() && (
          <div className="debug-panel">
            Environment: {Environment.current()}
          </div>
        )}
        <MyApplication />
      </div>
    </BrolostackProvider>
  );
}
```

## 🌍 **Environment Variables**

### Core Variables
```bash
# Primary environment setting
NODE_ENV=production
BROLOSTACK_ENV=staging

# Security settings
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Service configurations
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
MIXPANEL_TOKEN=your-mixpanel-token

# Authentication
AUTH_LOGIN_URL=https://auth.yourdomain.com/login
AUTH_LOGOUT_URL=https://auth.yourdomain.com/logout
```

### Environment-Specific .env Files

```bash
# .env.development
NODE_ENV=development
DEBUG=true
API_URL=http://localhost:3000

# .env.staging
NODE_ENV=staging
API_URL=https://staging-api.yourdomain.com
ENABLE_ANALYTICS=true

# .env.production
NODE_ENV=production
API_URL=https://api.yourdomain.com
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true
```

## 📊 **Monitoring and Statistics**

```typescript
import { Brolostack } from 'brolostack';

const app = new Brolostack({ /* config */ });

// Get comprehensive stats including environment info
const stats = app.getStats();
console.log(stats.environment);

/*
{
  current: 'production',
  debug: false,
  performance: {
    shouldMinify: true,
    shouldCompress: true,
    shouldTreeShake: true,
    shouldCache: true,
    cacheStrategy: 'advanced'
  },
  security: {
    showDetailedErrors: false,
    enableConsoleLogging: false,
    corsConfig: { enabled: true, origins: ['https://yourdomain.com'] }
  }
}
*/
```

## 🎛️ **Environment Switching**

### During Development

```bash
# Switch to different environments instantly
NODE_ENV=development npm start    # Development mode
NODE_ENV=test npm test           # Testing mode
NODE_ENV=staging npm run build  # Staging build
NODE_ENV=production npm run build # Production build
```

### Programmatic Switching (for testing)

```typescript
import { environmentManager } from 'brolostack';

// Switch environment programmatically (testing only)
environmentManager.switchEnvironment('testing');
console.log(Environment.current()); // 'testing'

// Reset to auto-detected environment
environmentManager.switchEnvironment(
  environmentManager.detectEnvironment()
);
```

## 🏆 **Best Practices**

### 1. **Use Environment Variables**
```typescript
// ✅ Good - Environment-aware
const apiUrl = process.env.API_URL || 'http://localhost:3000';

// ❌ Bad - Hard-coded
const apiUrl = 'https://api.yourdomain.com';
```

### 2. **Leverage Environment Utilities**
```typescript
// ✅ Good - Environment-aware logging
EnvironmentUtils.log.info('User action', { userId: 123 });

// ❌ Bad - Always logs
console.log('User action', { userId: 123 });
```

### 3. **Validate Environment Setup**
```typescript
// ✅ Good - Validate on startup
const validation = EnvironmentUtils.validateEnvironment();
if (!validation.valid) {
  throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
}
```

### 4. **Use Environment-Specific Configurations**
```typescript
// ✅ Good - Environment-optimized
const config = EnvironmentUtils.createEnvironmentConfig({
  appName: 'my-app',
  version 1.0.2'
});

// ❌ Bad - One-size-fits-all
const config = {
  appName: 'my-app',
  version 1.0.2',
  debug: true // Always on
};
```

## 🎉 **Conclusion**

Brolostack's environment management system provides:

- ✅ **Zero Configuration**: Works out of the box
- ✅ **Automatic Optimization**: System settings for each environment
- ✅ **Smooth Switching**: Seamless transitions between environments
- ✅ **Production Ready**: Enterprise-grade security and performance
- ✅ **Developer Friendly**: Enhanced debugging and development experience

**Your applications will automatically optimize themselves based on the environment, giving you the best performance in production and the best developer experience in development!** 🚀
