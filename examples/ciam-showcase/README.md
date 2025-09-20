# 🔐 Brolostack CIAM Integration Showcase

The most comprehensive demonstration of **Customer Identity and Access Management (CIAM)** integration with third-party authenticators, featuring Hybrid and Tribrid authentication modes.

## 🎯 What This Demo Shows

### 🔐 Third-Party CIAM Integration
- **Auth0**: Universal identity platform
- **Microsoft Entra ID**: Enterprise Azure Active Directory
- **Amazon Cognito**: AWS-native user management
- **Keycloak**: Open-source identity management
- **Okta**: Enterprise identity platform
- **Stytch**: Passwordless authentication
- **Firebase**: Google's authentication service
- **Frontegg**: B2B user management
- **WorkOS**: Enterprise SSO solution

### 🔄 Authentication Modes
- **Brolostack-Only**: Pure Brolostack authentication with local storage
- **Hybrid**: Brolostack + CIAM with automatic fallbacks
- **Tribrid**: Brolostack + CIAM + Cloud Providers for ultimate flexibility

### 💾 Storage Integration
- **Brolostack Encrypted Storage**: Devil security for all authentication data
- **Cross-Provider Synchronization**: User data synced across all providers
- **Offline Mode**: Authentication works even when CIAM providers are down

## 🚀 Quick Start

### Prerequisites
```bash
# Choose your CIAM provider and get credentials:

# Auth0
# - Create account at https://auth0.com
# - Get domain, client ID, and client secret

# Microsoft Entra ID
# - Azure AD tenant ID and application ID
# - Configure redirect URIs

# Amazon Cognito
# - User Pool ID and Web Client ID
# - Configure OAuth settings

# Firebase
# - Firebase project with Authentication enabled
# - Get API key and project configuration
```

### Installation
```bash
# This is a demo within the Brolostack framework
cd /Users/beunec/Documents/brolostack
npm install
npm run build

# Navigate to this example
cd examples/ciam-showcase

# In a real project, you would install:
# npm install brolostack
```

## 🔐 Configuration Examples

### Auth0 Integration
```typescript
import { BrolostackCIAMProvider } from 'brolostack';

<BrolostackCIAMProvider
  config={{
    provider: 'ciam',
    ciam: {
      provider: 'auth0',
      config: {
        auth0: {
          domain: 'your-domain.auth0.com',
          clientId: 'your-client-id',
          audience: 'your-api-identifier',
          scope: 'openid profile email'
        }
      },
      integration: {
        syncWithBrolostack: true,      // Sync with Brolostack storage
        useBrolostackStorage: true,    // Use Devil encryption
        enableOfflineMode: true        // Enable offline authentication
      }
    },
    tokenStorage: 'brolostack-encrypted',
    autoRefresh: true
  }}
>
  <YourApp />
</BrolostackCIAMProvider>
```

### Microsoft Entra ID Integration
```typescript
<BrolostackCIAMProvider
  config={{
    provider: 'ciam',
    ciam: {
      provider: 'entraId',
      config: {
        entraId: {
          tenantId: 'your-tenant-id',
          clientId: 'your-application-id',
          redirectUri: 'http://localhost:3000/auth/callback',
          scopes: ['User.Read', 'User.ReadBasic.All']
        }
      },
      integration: {
        syncWithBrolostack: true,
        useBrolostackStorage: true,
        enableOfflineMode: true
      }
    },
    advanced: {
      singleSignOn: true,              // Enterprise SSO
      riskBasedAuth: true,             // Conditional access
      adaptiveAuth: true               // Smart authentication
    }
  }}
>
  <EnterpriseApp />
</BrolostackCIAMProvider>
```

### Hybrid Mode (CIAM + Brolostack)
```typescript
<BrolostackCIAMProvider
  config={{
    provider: 'hybrid',
    ciam: {
      provider: 'cognito',
      config: {
        cognito: {
          userPoolId: 'us-east-1_XXXXXXXXX',
          userPoolWebClientId: 'your-client-id',
          region: 'us-east-1'
        }
      },
      integration: {
        syncWithBrolostack: true,
        useBrolostackStorage: true,
        enableOfflineMode: true
      }
    },
    hybrid: {
      mode: 'hybrid',
      primary: 'ciam',                 // Try Cognito first
      fallbacks: ['brolostack'],       // Fallback to Brolostack
      syncSessions: true,              // Sync sessions
      userMapping: {
        enabled: true,
        strategy: 'email'              // Map users by email
      }
    }
  }}
>
  <HybridApp />
</BrolostackCIAMProvider>
```

### Tribrid Mode (CIAM + Brolostack + Cloud)
```typescript
<BrolostackCIAMProvider
  config={{
    provider: 'tribrid',
    ciam: {
      provider: 'okta',
      config: {
        okta: {
          issuer: 'https://your-domain.okta.com',
          clientId: 'your-client-id'
        }
      }
    },
    cloudAuth: {
      aws: { region: 'us-east-1' },
      azure: { subscriptionId: 'your-subscription', tenantId: 'your-tenant' },
      gcp: { projectId: 'your-project' }
    },
    hybrid: {
      mode: 'tribrid',
      primary: 'ciam',
      fallbacks: ['cloud', 'brolostack'],
      syncSessions: true,
      tokenStrategy: 'all-providers'   // Use all provider tokens
    }
  }}
>
  <TribridApp />
</BrolostackCIAMProvider>
```

## 🔄 Usage Examples

### Basic Authentication
```typescript
import { useAuth } from 'brolostack';

function LoginComponent() {
  const { login, logout, isAuthenticated, user, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        username: 'user@example.com',
        password: 'password123'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <h1>Welcome, {user?.displayName}!</h1>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
```

### Social Authentication
```typescript
import { useSocialAuth } from 'brolostack';

function SocialLogin() {
  const { availableProviders, loginWithProvider, isLoading } = useSocialAuth();

  return (
    <div>
      <h3>Social Login:</h3>
      {availableProviders.map(provider => (
        <button
          key={provider}
          onClick={() => loginWithProvider(provider)}
          disabled={isLoading}
        >
          Login with {provider}
        </button>
      ))}
    </div>
  );
}

// Supported providers: Google, Microsoft, GitHub, Facebook, Twitter, LinkedIn
```

### Passwordless Authentication
```typescript
import { usePasswordlessAuth } from 'brolostack';

function PasswordlessLogin() {
  const { sendMagicLink, sendSMSCode, isLoading } = usePasswordlessAuth();
  const [email, setEmail] = useState('');

  const handleMagicLink = async () => {
    try {
      await sendMagicLink(email);
      alert('Magic link sent to your email!');
    } catch (error) {
      alert(`Failed: ${error.message}`);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleMagicLink} disabled={isLoading}>
        📧 Send Magic Link
      </button>
    </div>
  );
}
```

### Biometric Authentication
```typescript
import { useBiometricAuth } from 'brolostack';

function BiometricLogin() {
  const { isSupported, loginWithBiometric, isLoading } = useBiometricAuth();

  if (!isSupported) {
    return <div>Biometric authentication not supported</div>;
  }

  return (
    <button
      onClick={loginWithBiometric}
      disabled={isLoading}
    >
      👆 Login with Biometrics
    </button>
  );
}
```

### Protected Routes with RBAC
```typescript
import { ProtectedRoute, usePermissions } from 'brolostack';

function App() {
  return (
    <div>
      {/* Admin-only content */}
      <ProtectedRoute
        requireRoles={['admin']}
        fallback={<div>Admin access required</div>}
      >
        <AdminDashboard />
      </ProtectedRoute>

      {/* Permission-based content */}
      <ProtectedRoute
        requirePermissions={[
          { resource: 'users', action: 'read' },
          { resource: 'data', action: 'write' }
        ]}
      >
        <UserManagement />
      </ProtectedRoute>

      {/* MFA-protected content */}
      <ProtectedRoute
        requireMFA={true}
        fallback={<div>MFA required</div>}
      >
        <SensitiveData />
      </ProtectedRoute>
    </div>
  );
}
```

### Provider Management
```typescript
import { useProviderManagement } from 'brolostack';

function ProviderSwitcher() {
  const { 
    activeProviders, 
    switchToProvider, 
    isHybridMode, 
    primaryProvider 
  } = useProviderManagement();

  return (
    <div>
      <h3>Active Providers: {activeProviders.length}</h3>
      {activeProviders.map(provider => (
        <div key={provider}>
          {provider} {provider === primaryProvider && '(Primary)'}
        </div>
      ))}

      <button onClick={() => switchToProvider('ciam')}>
        Switch to CIAM
      </button>
      <button onClick={() => switchToProvider('cloud', 'aws')}>
        Switch to AWS
      </button>

      <div>Mode: {isHybridMode ? 'Hybrid' : 'Single'}</div>
    </div>
  );
}
```

## 🔧 Advanced Features

### Custom User Mapping
```typescript
const customMappingConfig = {
  ciam: {
    provider: 'auth0',
    integration: {
      customUserMapping: (auth0User) => ({
        id: auth0User.sub,
        username: auth0User.preferred_username,
        email: auth0User.email,
        displayName: auth0User.name,
        roles: mapAuth0RolesToBrolostack(auth0User['https://myapp.com/roles']),
        permissions: mapAuth0PermissionsToBrolostack(auth0User['https://myapp.com/permissions']),
        metadata: {
          auth0UserId: auth0User.sub,
          lastAuth0Login: auth0User.updated_at,
          auth0Metadata: auth0User.user_metadata
        }
      })
    }
  }
};
```

### Session Synchronization
```typescript
// Automatic session sync across providers
authManager.on('session-synced', (data) => {
  console.log('Sessions synchronized across providers:', data);
});

authManager.on('session-sync-failed', (error) => {
  console.error('Session sync failed:', error);
  // Handle sync failure (e.g., retry, fallback)
});
```

### Offline Mode
```typescript
// Enable offline authentication capability
const offlineConfig = {
  ciam: {
    integration: {
      enableOfflineMode: true,       // Cache auth data for offline use
      syncWithBrolostack: true,      // Sync when back online
      useBrolostackStorage: true     // Use encrypted local storage
    }
  }
};

// Benefits:
// ✅ Works without internet connection
// ✅ Cached user data in encrypted storage
// ✅ Automatic sync when connection restored
// ✅ Seamless user experience
```

## 🎯 Use Cases

### 1. 🏢 Enterprise B2B Application
```typescript
// Large enterprise with existing Microsoft infrastructure
const enterpriseConfig = {
  provider: 'hybrid',
  ciam: {
    provider: 'entraId',
    config: {
      entraId: {
        tenantId: 'company-tenant-id',
        clientId: 'enterprise-app-id'
      }
    }
  },
  hybrid: {
    primary: 'ciam',              // Use Entra ID first
    fallbacks: ['brolostack'],    // Brolostack for backup
    syncSessions: true
  },
  advanced: {
    singleSignOn: true,           // Enterprise SSO
    riskBasedAuth: true,          // Conditional access
    adaptiveAuth: true            // Smart authentication
  }
};
```

### 2. 🚀 Modern SaaS Startup
```typescript
// Startup using Auth0 for rapid development
const startupConfig = {
  provider: 'ciam',
  ciam: {
    provider: 'auth0',
    config: {
      auth0: {
        domain: 'startup.auth0.com',
        clientId: 'startup-client-id'
      }
    }
  },
  advanced: {
    socialLogins: ['google', 'github', 'microsoft'],
    passwordlessAuth: true,
    biometricAuth: true
  }
};
```

### 3. 🏥 Healthcare Application
```typescript
// HIPAA-compliant healthcare app
const healthcareConfig = {
  provider: 'tribrid',
  ciam: {
    provider: 'okta',             // Enterprise-grade security
    config: { okta: { issuer: 'https://healthcare.okta.com' } }
  },
  cloudAuth: {
    aws: { region: 'us-east-1' }  // HIPAA-compliant AWS
  },
  tokenStorage: 'brolostack-encrypted', // Devil encryption for PHI
  multiFactorAuth: {
    enabled: true,
    methods: ['totp', 'hardware']
  }
};
```

### 4. 🎓 Educational Platform
```typescript
// Educational platform with Google integration
const educationConfig = {
  provider: 'hybrid',
  ciam: {
    provider: 'firebase',
    config: {
      firebase: {
        apiKey: 'education-api-key',
        authDomain: 'education.firebaseapp.com'
      }
    }
  },
  advanced: {
    socialLogins: ['google'],     // Google for Education
    passwordlessAuth: true        // Easy for students
  }
};
```

## 📊 Benefits Comparison

| Feature | Brolostack-Only | Hybrid | Tribrid |
|---------|----------------|--------|---------|
| **Setup Complexity** | Simple | Medium | Advanced |
| **CIAM Features** | ❌ None | ✅ Full | ✅ Full |
| **Cloud Integration** | ❌ None | ❌ None | ✅ Full |
| **Offline Support** | ✅ Full | ✅ Full | ✅ Full |
| **Social Login** | ❌ Manual | ✅ Automatic | ✅ Automatic |
| **Enterprise SSO** | ❌ Manual | ✅ Automatic | ✅ Automatic |
| **Multi-Provider Fallback** | ❌ None | ✅ Yes | ✅ Yes |
| **Session Sync** | ❌ N/A | ✅ Yes | ✅ Yes |
| **Devil Encryption** | ✅ Yes | ✅ Yes | ✅ Yes |

## 🔧 Migration Guide

### From Basic Auth to CIAM
```typescript
// Before: Basic authentication
const authManager = new AuthManager({
  provider: 'local',
  endpoints: { login: '/api/login' }
});

// After: CIAM integration
const authManager = new AuthManager({
  provider: 'ciam',
  ciam: {
    provider: 'auth0',
    config: { auth0: { domain: 'your-domain.auth0.com' } },
    integration: {
      syncWithBrolostack: true,
      useBrolostackStorage: true
    }
  }
});

// Migration benefits:
// ✅ Professional authentication UI
// ✅ Social login support
// ✅ Enterprise features
// ✅ Reduced development time
```

### From Single Provider to Hybrid
```typescript
// Before: Single CIAM provider
const singleConfig = {
  provider: 'ciam',
  ciam: { provider: 'auth0' }
};

// After: Hybrid with fallbacks
const hybridConfig = {
  provider: 'hybrid',
  ciam: { provider: 'auth0' },
  hybrid: {
    primary: 'ciam',
    fallbacks: ['brolostack'],
    syncSessions: true
  }
};

// Migration benefits:
// ✅ Improved reliability
// ✅ Offline capability
// ✅ Automatic fallbacks
```

## 🛡️ Security Features

### Devil Encryption Integration
```typescript
// All CIAM data automatically encrypted with Devil security
const secureConfig = {
  tokenStorage: 'brolostack-encrypted',  // Devil encryption
  ciam: {
    integration: {
      useBrolostackStorage: true,        // Encrypted storage
      syncWithBrolostack: true           // Secure sync
    }
  }
};

// Security benefits:
// ✅ Zero-knowledge encryption
// ✅ Quantum-resistant security
// ✅ Self-evolving protection
// ✅ CIAM data protected by Devil
```

### Multi-Factor Authentication
```typescript
// MFA integration with CIAM providers
const mfaConfig = {
  multiFactorAuth: {
    enabled: true,
    methods: ['totp', 'sms', 'email', 'hardware'],
    ciamMfaIntegration: true         // Use CIAM provider's MFA
  }
};

// MFA features:
// ✅ CIAM provider MFA integration
// ✅ Brolostack MFA fallback
// ✅ Multiple authentication factors
// ✅ Enterprise-grade security
```

## 📈 Performance & Reliability

### Automatic Fallbacks
- **Primary Provider Failure**: Automatic switch to fallback providers
- **Network Issues**: Offline mode with cached authentication
- **Service Outages**: Multi-provider redundancy
- **Token Expiry**: Automatic refresh across all providers

### Session Management
- **Cross-Provider Sync**: Sessions synchronized every 5 minutes
- **Conflict Resolution**: Intelligent handling of conflicting sessions
- **Token Strategy**: Configurable token usage from multiple providers
- **Offline Persistence**: Encrypted local storage for offline access

## 🔧 Troubleshooting

### Common Issues

**Q: CIAM provider initialization fails**
A: Check your provider configuration (domain, client ID, etc.) and ensure the provider SDK is properly configured.

**Q: Session sync is slow**
A: Adjust sync interval or disable real-time sync for better performance.

**Q: Offline mode not working**
A: Ensure `enableOfflineMode: true` and `useBrolostackStorage: true` in CIAM integration config.

**Q: Social login redirects fail**
A: Verify redirect URIs are properly configured in your CIAM provider dashboard.

## 📚 Provider Documentation

### Auth0 Setup
1. Create Auth0 account and application
2. Configure allowed callback URLs
3. Set up social connections (optional)
4. Configure user roles and permissions

### Microsoft Entra ID Setup
1. Register application in Azure portal
2. Configure authentication and redirect URIs
3. Set up API permissions
4. Configure conditional access policies

### Amazon Cognito Setup
1. Create User Pool and User Pool Client
2. Configure OAuth settings and domains
3. Set up identity providers (optional)
4. Configure user attributes and groups

## 📄 License

MIT License - Build secure, scalable authentication systems.

---

## 🔐 THE CIAM INTEGRATION IS ACTIVE

**Current Status**: REVOLUTIONARY AUTHENTICATION SYSTEM  
**CIAM Providers**: 9 MAJOR PROVIDERS SUPPORTED  
**Authentication Modes**: BROLOSTACK / HYBRID / TRIBRID  
**Storage Integration**: DEVIL ENCRYPTION ACTIVE  
**Advanced Features**: SOCIAL / PASSWORDLESS / BIOMETRIC / MFA  

**🔐 THE MOST COMPREHENSIVE AUTHENTICATION SYSTEM EVER CREATED! 🔐**
