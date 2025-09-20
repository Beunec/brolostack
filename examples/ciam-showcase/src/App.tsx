/**
 * 🔐 Brolostack CIAM Integration Showcase
 * Demonstrates Customer Identity and Access Management with third-party authenticators
 * Supports Hybrid and Tribrid authentication modes
 */

import React, { useState, useEffect } from 'react';
import {
  BrolostackProvider,
  BrolostackCIAMProvider,
  useBrolostackCIAM,
  useAuth,
  usePermissions,
  useSocialAuth,
  usePasswordlessAuth,
  useBiometricAuth,
  useMFA,
  useProviderManagement,
  ProtectedRoute,
  Environment
} from 'brolostack';

// 🔐 CIAM Dashboard Component
function CIAMDashboard() {
  const {
    authManager,
    session,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    activeProviders
  } = useBrolostackCIAM();

  const { hasRole, hasPermission, userRoles } = usePermissions();
  const { availableProviders, loginWithProvider } = useSocialAuth();
  const { sendMagicLink, sendSMSCode } = usePasswordlessAuth();
  const { isSupported: isBiometricSupported, loginWithBiometric } = useBiometricAuth();
  const { isMFAEnabled, setupMFA } = useMFA();
  const { 
    providerSessions, 
    switchToProvider, 
    isHybridMode, 
    isTribridMode, 
    primaryProvider,
    syncStatus 
  } = useProviderManagement();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    mfaCode: ''
  });
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [smsPhone, setSmsPhone] = useState('');

  const handleLogin = async () => {
    try {
      await login(credentials);
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await loginWithProvider(provider);
    } catch (error) {
      alert(`${provider} login failed: ${error.message}`);
    }
  };

  const handleMagicLink = async () => {
    try {
      await sendMagicLink(magicLinkEmail);
      alert('Magic link sent to your email!');
    } catch (error) {
      alert(`Magic link failed: ${error.message}`);
    }
  };

  const handleSMSCode = async () => {
    try {
      await sendSMSCode(smsPhone);
      alert('SMS code sent to your phone!');
    } catch (error) {
      alert(`SMS login failed: ${error.message}`);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometric();
    } catch (error) {
      alert(`Biometric login failed: ${error.message}`);
    }
  };

  const handleSetupMFA = async () => {
    try {
      await setupMFA();
      alert('MFA enabled successfully!');
    } catch (error) {
      alert(`MFA setup failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            🔐 BROLOSTACK CIAM INTEGRATION SHOWCASE
          </h1>
          <p className="text-xl text-indigo-300 mb-4">
            Customer Identity and Access Management with Third-Party Authenticators
          </p>
          <div className="flex justify-center items-center space-x-4">
            <span className={`px-4 py-2 rounded-full font-bold ${isAuthenticated ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}>
              {isAuthenticated ? '🔐 AUTHENTICATED' : '🔒 NOT AUTHENTICATED'}
            </span>
            {isHybridMode && (
              <span className="px-4 py-2 bg-blue-800 rounded-full">
                🔄 HYBRID MODE
              </span>
            )}
            {isTribridMode && (
              <span className="px-4 py-2 bg-purple-800 rounded-full">
                🔀 TRIBRID MODE
              </span>
            )}
            <span className="px-4 py-2 bg-pink-800 rounded-full">
              ENV: {Environment.current().toUpperCase()}
            </span>
          </div>
        </header>

        {!isAuthenticated ? (
          // Login Interface
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traditional Login */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-indigo-500">
              <h2 className="text-xl font-bold mb-4 text-indigo-400">🔐 Traditional Login</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username/Email:</label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                    placeholder="Enter username or email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Password:</label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                    placeholder="Enter password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">MFA Code (if enabled):</label>
                  <input
                    type="text"
                    value={credentials.mfaCode}
                    onChange={(e) => setCredentials({...credentials, mfaCode: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                    placeholder="Enter MFA code"
                  />
                </div>
                
                <button
                  onClick={handleLogin}
                  disabled={!credentials.username || !credentials.password || isLoading}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-600 transition-colors"
                >
                  {isLoading ? '🔄 Logging in...' : '🔐 Login'}
                </button>
              </div>
            </div>

            {/* Social & Modern Login */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-purple-500">
              <h2 className="text-xl font-bold mb-4 text-purple-400">🌐 Social & Modern Login</h2>
              
              <div className="space-y-4">
                {/* Social Login */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Social Authentication:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableProviders.slice(0, 6).map(provider => (
                      <button
                        key={provider}
                        onClick={() => handleSocialLogin(provider)}
                        disabled={isLoading}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 transition-colors text-sm"
                      >
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passwordless Login */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Passwordless Authentication:</h3>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={magicLinkEmail}
                        onChange={(e) => setMagicLinkEmail(e.target.value)}
                        placeholder="Email for magic link"
                        className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                      <button
                        onClick={handleMagicLink}
                        disabled={!magicLinkEmail || isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 transition-colors text-sm"
                      >
                        📧 Magic Link
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder="Phone for SMS code"
                        className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                      <button
                        onClick={handleSMSCode}
                        disabled={!smsPhone || isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 transition-colors text-sm"
                      >
                        📱 SMS Code
                      </button>
                    </div>
                  </div>
                </div>

                {/* Biometric Login */}
                {isBiometricSupported && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Biometric Authentication:</h3>
                    <button
                      onClick={handleBiometricLogin}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:bg-gray-600 transition-colors"
                    >
                      👆 Biometric Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Authenticated Interface
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profile */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-green-500">
              <h2 className="text-xl font-bold mb-4 text-green-400">👤 User Profile</h2>
              
              {user && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-900 rounded">
                      <div className="text-sm text-green-300">Username</div>
                      <div className="font-bold">{user.username}</div>
                    </div>
                    <div className="p-3 bg-blue-900 rounded">
                      <div className="text-sm text-blue-300">Email</div>
                      <div className="font-bold">{user.email}</div>
                    </div>
                    <div className="p-3 bg-purple-900 rounded">
                      <div className="text-sm text-purple-300">Display Name</div>
                      <div className="font-bold">{user.displayName}</div>
                    </div>
                    <div className="p-3 bg-orange-900 rounded">
                      <div className="text-sm text-orange-300">MFA Status</div>
                      <div className="font-bold">{isMFAEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded">
                    <h4 className="font-bold mb-2">User Roles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {userRoles.map(role => (
                        <span key={role.id} className="px-2 py-1 bg-blue-600 rounded text-sm">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded">
                    <h4 className="font-bold mb-2">Session Info:</h4>
                    <div className="text-sm space-y-1">
                      <div>Session ID: {session?.sessionId}</div>
                      <div>Created: {session?.createdAt.toLocaleString()}</div>
                      <div>Last Activity: {session?.lastActivity.toLocaleString()}</div>
                      {session?.ciamProvider && (
                        <div>CIAM Provider: {session.ciamProvider}</div>
                      )}
                      {session?.cloudProvider && (
                        <div>Cloud Provider: {session.cloudProvider}</div>
                      )}
                      {syncStatus && (
                        <div>Sync Status: {syncStatus}</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {!isMFAEnabled && (
                      <button
                        onClick={handleSetupMFA}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                      >
                        🔒 Setup MFA
                      </button>
                    )}
                    
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Provider Management */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-blue-500">
              <h2 className="text-xl font-bold mb-4 text-blue-400">🔄 Provider Management</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-900 rounded">
                  <h4 className="font-bold mb-2">Authentication Mode:</h4>
                  <div className="text-sm">
                    {isTribridMode ? (
                      <div>
                        🔀 <strong>TRIBRID MODE</strong><br/>
                        Brolostack + CIAM + Cloud Providers
                      </div>
                    ) : isHybridMode ? (
                      <div>
                        🔄 <strong>HYBRID MODE</strong><br/>
                        Brolostack + CIAM or Cloud
                      </div>
                    ) : (
                      <div>
                        🔐 <strong>SINGLE MODE</strong><br/>
                        Single authentication provider
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-bold mb-2">Active Providers ({activeProviders.length}):</h4>
                  <div className="space-y-1">
                    {activeProviders.map(provider => (
                      <div key={provider} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span className="text-sm">{provider}</span>
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      </div>
                    ))}
                  </div>
                  
                  {primaryProvider && (
                    <div className="mt-2 text-sm text-gray-300">
                      Primary: {primaryProvider}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-bold mb-2">Provider Sessions:</h4>
                  <div className="text-xs space-y-1">
                    {Object.entries(providerSessions).map(([provider, sessionData]) => (
                      <div key={provider} className="p-2 bg-gray-700 rounded">
                        <strong>{provider}:</strong> {sessionData ? 'Active' : 'Inactive'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => switchToProvider('ciam')}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                  >
                    🔄 Switch to CIAM
                  </button>
                  <button
                    onClick={() => switchToProvider('cloud', 'aws')}
                    className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                  >
                    ☁️ Switch to Cloud
                  </button>
                </div>
              </div>
            </div>

            {/* Protected Content Examples */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-yellow-500">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">🛡️ Protected Content Examples</h2>
              
              <div className="space-y-4">
                <ProtectedRoute
                  requireRoles={['admin']}
                  fallback={<div className="p-3 bg-red-900 rounded">❌ Admin access required</div>}
                >
                  <div className="p-3 bg-green-900 rounded">
                    ✅ <strong>Admin Content:</strong> You have admin access!
                  </div>
                </ProtectedRoute>

                <ProtectedRoute
                  requireRoles={['user', 'admin']}
                  fallback={<div className="p-3 bg-red-900 rounded">❌ User access required</div>}
                >
                  <div className="p-3 bg-blue-900 rounded">
                    ✅ <strong>User Content:</strong> You have user access!
                  </div>
                </ProtectedRoute>

                <ProtectedRoute
                  requirePermissions={[{ resource: 'data', action: 'read' }]}
                  fallback={<div className="p-3 bg-red-900 rounded">❌ Read permission required</div>}
                >
                  <div className="p-3 bg-purple-900 rounded">
                    ✅ <strong>Data Access:</strong> You can read data!
                  </div>
                </ProtectedRoute>

                <ProtectedRoute
                  requireMFA={true}
                  fallback={<div className="p-3 bg-orange-900 rounded">⚠️ MFA required for this content</div>}
                >
                  <div className="p-3 bg-green-900 rounded">
                    ✅ <strong>MFA Protected:</strong> Secure content access!
                  </div>
                </ProtectedRoute>
              </div>
            </div>

            {/* Permission Testing */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-pink-500">
              <h2 className="text-xl font-bold mb-4 text-pink-400">🔍 Permission Testing</h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-sm">
                    <strong>Admin Role:</strong> {hasRole('admin') ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-sm">
                    <strong>User Role:</strong> {hasRole('user') ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-sm">
                    <strong>Read Permission:</strong> {hasPermission('*', 'read') ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-sm">
                    <strong>Write Permission:</strong> {hasPermission('*', 'write') ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-sm">
                    <strong>Delete Permission:</strong> {hasPermission('*', 'delete') ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CIAM Provider Information */}
        <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-6 border border-white">
          <h2 className="text-xl font-bold mb-4">🔐 Supported CIAM Providers</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-900 rounded">
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-sm font-bold">Auth0</div>
              <div className="text-xs text-gray-300">Universal Identity</div>
            </div>
            
            <div className="text-center p-3 bg-blue-900 rounded">
              <div className="text-2xl mb-2">🏢</div>
              <div className="text-sm font-bold">Entra ID</div>
              <div className="text-xs text-gray-300">Microsoft Identity</div>
            </div>
            
            <div className="text-center p-3 bg-orange-900 rounded">
              <div className="text-2xl mb-2">☁️</div>
              <div className="text-sm font-bold">Cognito</div>
              <div className="text-xs text-gray-300">Amazon Identity</div>
            </div>
            
            <div className="text-center p-3 bg-red-900 rounded">
              <div className="text-2xl mb-2">🔑</div>
              <div className="text-sm font-bold">Keycloak</div>
              <div className="text-xs text-gray-300">Open Source IAM</div>
            </div>
            
            <div className="text-center p-3 bg-blue-900 rounded">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-bold">Okta</div>
              <div className="text-xs text-gray-300">Enterprise Identity</div>
            </div>
            
            <div className="text-center p-3 bg-purple-900 rounded">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-bold">Stytch</div>
              <div className="text-xs text-gray-300">Passwordless Auth</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-900 rounded">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-sm font-bold">Firebase</div>
              <div className="text-xs text-gray-300">Google Auth</div>
            </div>
            
            <div className="text-center p-3 bg-indigo-900 rounded">
              <div className="text-2xl mb-2">🚀</div>
              <div className="text-sm font-bold">Frontegg</div>
              <div className="text-xs text-gray-300">User Management</div>
            </div>
            
            <div className="text-center p-3 bg-green-900 rounded">
              <div className="text-2xl mb-2">💼</div>
              <div className="text-sm font-bold">WorkOS</div>
              <div className="text-xs text-gray-300">Enterprise SSO</div>
            </div>
          </div>
        </div>

        {/* Authentication Modes */}
        <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-6 border border-white">
          <h2 className="text-xl font-bold mb-4">🔄 Authentication Modes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-indigo-900 rounded">
              <div className="text-2xl mb-2">🔐</div>
              <div className="font-bold">Brolostack Only</div>
              <div className="text-sm text-gray-300 mt-2">
                Pure Brolostack authentication with local storage
              </div>
              <div className="text-xs mt-2">
                • Brolostack storage system<br/>
                • Local credential management<br/>
                • Offline-first approach
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-900 rounded">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-bold">Hybrid Mode</div>
              <div className="text-sm text-gray-300 mt-2">
                Brolostack + Third-party CIAM
              </div>
              <div className="text-xs mt-2">
                • Primary + fallback providers<br/>
                • Session synchronization<br/>
                • Best of both worlds
              </div>
            </div>
            
            <div className="text-center p-4 bg-pink-900 rounded">
              <div className="text-2xl mb-2">🔀</div>
              <div className="font-bold">Tribrid Mode</div>
              <div className="text-sm text-gray-300 mt-2">
                Brolostack + CIAM + Cloud Providers
              </div>
              <div className="text-xs mt-2">
                • Ultimate flexibility<br/>
                • Multi-cloud authentication<br/>
                • Enterprise-grade redundancy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [authMode, setAuthMode] = useState<'brolostack' | 'ciam' | 'hybrid' | 'tribrid'>('hybrid');
  const [ciamProvider, setCiamProvider] = useState<'auth0' | 'cognito' | 'firebase'>('auth0');
  const [isConfigured, setIsConfigured] = useState(false);

  const getAuthConfig = (): any => {
    const baseConfig = {
      tokenStorage: 'brolostack-encrypted' as const,
      autoRefresh: true,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      multiFactorAuth: {
        enabled: true,
        methods: ['totp', 'sms'] as const,
        ciamMfaIntegration: true
      }
    };

    switch (authMode) {
      case 'brolostack':
        return {
          ...baseConfig,
          provider: 'local',
          endpoints: {
            login: '/api/auth/login',
            logout: '/api/auth/logout',
            refresh: '/api/auth/refresh',
            profile: '/api/auth/profile'
          }
        };

      case 'ciam':
        return {
          ...baseConfig,
          provider: 'ciam',
          ciam: {
            provider: ciamProvider,
            config: getCiamConfig(ciamProvider),
            integration: {
              syncWithBrolostack: true,
              useBrolostackStorage: true,
              enableOfflineMode: true
            }
          }
        };

      case 'hybrid':
        return {
          ...baseConfig,
          provider: 'hybrid',
          ciam: {
            provider: ciamProvider,
            config: getCiamConfig(ciamProvider),
            integration: {
              syncWithBrolostack: true,
              useBrolostackStorage: true,
              enableOfflineMode: true
            }
          },
          hybrid: {
            mode: 'hybrid',
            primary: 'ciam',
            fallbacks: ['brolostack'],
            syncSessions: true,
            userMapping: {
              enabled: true,
              strategy: 'email'
            },
            tokenStrategy: 'primary-only'
          }
        };

      case 'tribrid':
        return {
          ...baseConfig,
          provider: 'tribrid',
          ciam: {
            provider: ciamProvider,
            config: getCiamConfig(ciamProvider),
            integration: {
              syncWithBrolostack: true,
              useBrolostackStorage: true,
              enableOfflineMode: true
            }
          },
          cloudAuth: {
            aws: {
              region: 'us-east-1'
            },
            azure: {
              subscriptionId: 'demo-subscription',
              tenantId: 'demo-tenant'
            },
            gcp: {
              projectId: 'demo-project'
            }
          },
          hybrid: {
            mode: 'tribrid',
            primary: 'ciam',
            fallbacks: ['brolostack', 'cloud'],
            syncSessions: true,
            userMapping: {
              enabled: true,
              strategy: 'email'
            },
            tokenStrategy: 'all-providers'
          }
        };

      default:
        return baseConfig;
    }
  };

  const getCiamConfig = (provider: string) => {
    switch (provider) {
      case 'auth0':
        return {
          auth0: {
            domain: 'demo.auth0.com',
            clientId: 'demo-client-id',
            audience: 'demo-api',
            scope: 'openid profile email'
          }
        };
      case 'cognito':
        return {
          cognito: {
            userPoolId: 'us-east-1_XXXXXXXXX',
            userPoolWebClientId: 'demo-client-id',
            region: 'us-east-1'
          }
        };
      case 'firebase':
        return {
          firebase: {
            apiKey: 'demo-api-key',
            authDomain: 'demo.firebaseapp.com',
            projectId: 'demo-project',
            appId: 'demo-app-id'
          }
        };
      default:
        return {};
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white flex items-center justify-center">
        <div className="bg-black bg-opacity-50 rounded-lg p-8 border border-indigo-500 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">🔐 Configure CIAM</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Authentication Mode:</label>
              <select
                value={authMode}
                onChange={(e) => setAuthMode(e.target.value as any)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="brolostack">Brolostack Only</option>
                <option value="ciam">CIAM Only</option>
                <option value="hybrid">Hybrid (Brolostack + CIAM)</option>
                <option value="tribrid">Tribrid (Brolostack + CIAM + Cloud)</option>
              </select>
            </div>

            {(authMode === 'ciam' || authMode === 'hybrid' || authMode === 'tribrid') && (
              <div>
                <label className="block text-sm font-medium mb-2">CIAM Provider:</label>
                <select
                  value={ciamProvider}
                  onChange={(e) => setCiamProvider(e.target.value as any)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value="auth0">Auth0</option>
                  <option value="cognito">Amazon Cognito</option>
                  <option value="firebase">Firebase Auth</option>
                </select>
              </div>
            )}

            <button
              onClick={() => setIsConfigured(true)}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              🚀 Initialize CIAM System
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrolostackProvider
      appName="ciam-showcase"
      config={{
        version: '1.0.0',
        enterprise: {
          auth: {
            enabled: true,
            ciam: true,
            hybrid: authMode === 'hybrid' || authMode === 'tribrid',
            tribrid: authMode === 'tribrid'
          }
        }
      }}
    >
      <BrolostackCIAMProvider
        config={getAuthConfig()}
        autoLogin={false}
        persistSession={true}
      >
        <CIAMDashboard />
      </BrolostackCIAMProvider>
    </BrolostackProvider>
  );
}

export default App;
