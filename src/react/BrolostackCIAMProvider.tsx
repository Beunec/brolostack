/**
 * 🔐 Brolostack CIAM React Provider
 * Complete React integration for Customer Identity and Access Management
 * Supports Auth0, Microsoft Entra ID, Amazon Cognito, Keycloak, Okta, Stytch, Firebase, Frontegg, WorkOS
 * With Hybrid and Tribrid authentication modes
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  AuthManager, 
  AuthConfig, 
  AuthSession, 
  User, 
  LoginCredentials 
} from '../auth/AuthManager';
import { Environment } from '../core/EnvironmentManager';

interface BrolostackCIAMContextType {
  authManager: AuthManager;
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => Promise<void>;
  socialLogin: (provider: string) => Promise<AuthSession>;
  passwordlessLogin: (identifier: string) => Promise<AuthSession>;
  biometricLogin: () => Promise<AuthSession>;
  enableMFA: () => Promise<void>;
  
  // Provider management
  activeProviders: string[];
  switchProvider: (type: 'ciam' | 'cloud', name?: string) => Promise<void>;
  getProviderSession: (name: string) => any;
  
  // Session management
  refreshToken: () => Promise<void>;
  isTokenValid: () => boolean;
}

const BrolostackCIAMContext = createContext<BrolostackCIAMContextType | null>(null);

export interface BrolostackCIAMProviderProps {
  children: ReactNode;
  config: AuthConfig;
  autoLogin?: boolean;
  persistSession?: boolean;
}

export function BrolostackCIAMProvider({
  children,
  config,
  autoLogin = false,
  persistSession = true
}: BrolostackCIAMProviderProps) {
  const [authManager] = useState(() => new AuthManager(config));
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProviders, setActiveProviders] = useState<string[]>([]);

  useEffect(() => {
    // Initialize authentication system
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Try to restore session if persistence is enabled
        if (persistSession) {
          await restoreSession();
        }

        // Auto-login if enabled and no existing session
        if (autoLogin && !session) {
          // This would typically redirect to the configured CIAM provider
          console.log('Auto-login enabled - redirect to CIAM provider');
        }

        setActiveProviders(authManager.getActiveProviders());

      } catch (error) {
        console.error('🔐 Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for authentication events
    authManager.on('login-success', (data: any) => {
      setSession(data.session);
      setUser(data.session.user);
      setActiveProviders(authManager.getActiveProviders());
      
      if (Environment.isDev()) {
        console.log('🔐 Login successful:', {
          provider: data.provider,
          user: data.session.user.username,
          hybridMode: data.session.hybridMode || false
        });
      }
    });

    authManager.on('logout', () => {
      setSession(null);
      setUser(null);
      setActiveProviders([]);
      
      if (Environment.isDev()) {
        console.log('🔐 User logged out');
      }
    });

    authManager.on('token-refreshed', (data: any) => {
      if (session) {
        setSession({ ...session, token: data.token });
      }
      
      if (Environment.isDev()) {
        console.log('🔐 Token refreshed');
      }
    });

    authManager.on('session-synced', (data: any) => {
      if (Environment.isDev()) {
        console.log('🔐 Session synced across providers:', data);
      }
    });

    authManager.on('provider-switched', (data: any) => {
      setActiveProviders(authManager.getActiveProviders());
      
      if (Environment.isDev()) {
        console.log('🔐 Provider switched:', data);
      }
    });

    authManager.on('social-login-success', (data: any) => {
      setSession(data.session);
      setUser(data.session.user);
      
      if (Environment.isDev()) {
        console.log('🔐 Social login successful:', data.provider);
      }
    });

    authManager.on('mfa-enabled', () => {
      if (user) {
        setUser({ ...user, mfaEnabled: true });
      }
      
      if (Environment.isDev()) {
        console.log('🔐 MFA enabled');
      }
    });

    return () => {
      authManager.removeAllListeners();
    };
  }, [authManager, autoLogin, persistSession]);

  const restoreSession = async () => {
    try {
      // Try to restore from stored token
      const storedToken = await getStoredToken();
      if (storedToken && authManager.isTokenValid()) {
        const currentUser = authManager.getCurrentUser();
        const currentSession = authManager.getCurrentSession();
        
        if (currentUser && currentSession) {
          setUser(currentUser);
          setSession(currentSession);
        }
      }
    } catch (error) {
      console.error('🔐 Session restoration failed:', error);
    }
  };

  const getStoredToken = async (): Promise<any> => {
    try {
      switch (config.tokenStorage) {
        case 'localStorage':
          return localStorage.getItem('brolostack_auth_token');
        case 'sessionStorage':
          return sessionStorage.getItem('brolostack_auth_token');
        case 'brolostack-encrypted':
          const encrypted = localStorage.getItem('brolostack_auth_token');
          return encrypted ? await authManager['decryptValue'](encrypted) : null;
        default:
          return null;
      }
    } catch (error) {
      console.error('🔐 Failed to get stored token:', error);
      return null;
    }
  };

  // Authentication methods
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const loginSession = await authManager.login(credentials);
      return loginSession;
    } catch (error) {
      console.error('🔐 Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authManager]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authManager.logout();
    } catch (error) {
      console.error('🔐 Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authManager]);

  const socialLogin = useCallback(async (provider: string) => {
    setIsLoading(true);
    try {
      const loginSession = await authManager.socialLogin(provider);
      return loginSession;
    } catch (error) {
      console.error('🔐 Social login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authManager]);

  const passwordlessLogin = useCallback(async (identifier: string) => {
    setIsLoading(true);
    try {
      const loginSession = await authManager.passwordlessLogin(identifier);
      return loginSession;
    } catch (error) {
      console.error('🔐 Passwordless login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authManager]);

  const biometricLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const loginSession = await authManager.biometricLogin();
      return loginSession;
    } catch (error) {
      console.error('🔐 Biometric login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authManager]);

  const enableMFA = useCallback(async () => {
    try {
      await authManager.enableMFA();
    } catch (error) {
      console.error('🔐 MFA enable failed:', error);
      throw error;
    }
  }, [authManager]);

  const refreshToken = useCallback(async () => {
    try {
      await authManager.refreshToken();
    } catch (error) {
      console.error('🔐 Token refresh failed:', error);
      throw error;
    }
  }, [authManager]);

  const switchProvider = useCallback(async (type: 'ciam' | 'cloud', name?: string) => {
    try {
      await authManager.switchProvider(type, name);
      setActiveProviders(authManager.getActiveProviders());
    } catch (error) {
      console.error('🔐 Provider switch failed:', error);
      throw error;
    }
  }, [authManager]);

  const getProviderSession = useCallback((name: string) => {
    return authManager.getProviderSession(name);
  }, [authManager]);

  const isTokenValid = useCallback(() => {
    return authManager.isTokenValid();
  }, [authManager]);

  const contextValue: BrolostackCIAMContextType = {
    authManager,
    session,
    user,
    isAuthenticated: !!session && authManager.isAuthenticated(),
    isLoading,
    
    // Methods
    login,
    logout,
    socialLogin,
    passwordlessLogin,
    biometricLogin,
    enableMFA,
    refreshToken,
    isTokenValid,
    
    // Provider management
    activeProviders,
    switchProvider,
    getProviderSession
  };

  return (
    <BrolostackCIAMContext.Provider value={contextValue}>
      {children}
      {Environment.isDev() && session && (
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: 'rgba(0, 255, 100, 0.1)',
          border: '2px solid green',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999
        }}>
          🔐 CIAM ACTIVE<br/>
          Provider: {config.ciam?.provider || config.provider}<br/>
          User: {user?.username}<br/>
          Mode: {session.hybridMode ? 'HYBRID' : session.tribridMode ? 'TRIBRID' : 'SINGLE'}<br/>
          Providers: {activeProviders.length}
        </div>
      )}
    </BrolostackCIAMContext.Provider>
  );
}

/**
 * 🔐 Hook for using Brolostack CIAM
 */
export function useBrolostackCIAM() {
  const context = useContext(BrolostackCIAMContext);
  
  if (!context) {
    throw new Error('useBrolostackCIAM must be used within a BrolostackCIAMProvider');
  }
  
  return context;
}

/**
 * 🔐 Hook for authentication state
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useBrolostackCIAM();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}

/**
 * 🔐 Hook for role-based access control
 */
export function usePermissions() {
  const { authManager, user } = useBrolostackCIAM();
  
  const hasPermission = useCallback((resource: string, action: string, context?: any) => {
    return authManager.hasPermission(resource, action, context);
  }, [authManager]);
  
  const hasRole = useCallback((roleName: string) => {
    return authManager.hasRole(roleName);
  }, [authManager]);
  
  const hasAnyRole = useCallback((roleNames: string[]) => {
    return authManager.hasAnyRole(roleNames);
  }, [authManager]);
  
  const hasAllRoles = useCallback((roleNames: string[]) => {
    return authManager.hasAllRoles(roleNames);
  }, [authManager]);
  
  const getHighestRole = useCallback(() => {
    return authManager.getHighestRole();
  }, [authManager]);
  
  return {
    user,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getHighestRole,
    userRoles: user?.roles || [],
    userPermissions: user?.permissions || []
  };
}

/**
 * 🔐 Hook for social authentication
 */
export function useSocialAuth() {
  const { socialLogin, isLoading } = useBrolostackCIAM();
  const [availableProviders] = useState([
    'google', 'microsoft', 'github', 'facebook', 'twitter', 'linkedin'
  ]);
  
  const loginWithProvider = useCallback(async (provider: string) => {
    try {
      const session = await socialLogin(provider);
      return session;
    } catch (error) {
      console.error(`🔐 ${provider} login failed:`, error);
      throw error;
    }
  }, [socialLogin]);
  
  return {
    availableProviders,
    loginWithProvider,
    isLoading
  };
}

/**
 * 🔐 Hook for passwordless authentication
 */
export function usePasswordlessAuth() {
  const { passwordlessLogin, isLoading } = useBrolostackCIAM();
  
  const sendMagicLink = useCallback(async (email: string) => {
    try {
      const session = await passwordlessLogin(email);
      return session;
    } catch (error) {
      console.error('🔐 Magic link failed:', error);
      throw error;
    }
  }, [passwordlessLogin]);
  
  const sendSMSCode = useCallback(async (phoneNumber: string) => {
    try {
      const session = await passwordlessLogin(phoneNumber);
      return session;
    } catch (error) {
      console.error('🔐 SMS code failed:', error);
      throw error;
    }
  }, [passwordlessLogin]);
  
  return {
    sendMagicLink,
    sendSMSCode,
    isLoading
  };
}

/**
 * 🔐 Hook for biometric authentication
 */
export function useBiometricAuth() {
  const { biometricLogin, isLoading } = useBrolostackCIAM();
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    // Check if biometric authentication is supported
    const checkBiometricSupport = async () => {
      try {
        if ('credentials' in navigator && 'create' in navigator.credentials) {
          setIsSupported(true);
        }
      } catch (error) {
        setIsSupported(false);
      }
    };
    
    checkBiometricSupport();
  }, []);
  
  const loginWithBiometric = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Biometric authentication not supported on this device');
    }
    
    try {
      const session = await biometricLogin();
      return session;
    } catch (error) {
      console.error('🔐 Biometric login failed:', error);
      throw error;
    }
  }, [biometricLogin, isSupported]);
  
  return {
    isSupported,
    loginWithBiometric,
    isLoading
  };
}

/**
 * 🔐 Hook for multi-factor authentication
 */
export function useMFA() {
  const { enableMFA, user, isLoading } = useBrolostackCIAM();
  
  const setupMFA = useCallback(async () => {
    try {
      await enableMFA();
    } catch (error) {
      console.error('🔐 MFA setup failed:', error);
      throw error;
    }
  }, [enableMFA]);
  
  return {
    isMFAEnabled: user?.mfaEnabled || false,
    setupMFA,
    isLoading
  };
}

/**
 * 🔐 Hook for provider management
 */
export function useProviderManagement() {
  const { 
    activeProviders, 
    switchProvider, 
    getProviderSession, 
    session 
  } = useBrolostackCIAM();
  
  const [providerSessions, setProviderSessions] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // Update provider sessions when active providers change
    const sessions: Record<string, any> = {};
    for (const provider of activeProviders) {
      const providerSession = getProviderSession(provider);
      if (providerSession) {
        sessions[provider] = providerSession;
      }
    }
    setProviderSessions(sessions);
  }, [activeProviders, getProviderSession]);
  
  const switchToProvider = useCallback(async (type: 'ciam' | 'cloud', name?: string) => {
    try {
      await switchProvider(type, name);
    } catch (error) {
      console.error('🔐 Provider switch failed:', error);
      throw error;
    }
  }, [switchProvider]);
  
  return {
    activeProviders,
    providerSessions,
    switchToProvider,
    isHybridMode: session?.hybridMode || false,
    isTribridMode: session?.tribridMode || false,
    primaryProvider: session?.primaryProvider,
    syncStatus: session?.syncStatus
  };
}

/**
 * 🔐 Protected Route Component
 */
export function ProtectedRoute({
  children,
  fallback,
  requireRoles,
  requirePermissions,
  requireMFA
}: {
  children: ReactNode;
  fallback?: ReactNode;
  requireRoles?: string[];
  requirePermissions?: Array<{ resource: string; action: string }>;
  requireMFA?: boolean;
}) {
  const { isAuthenticated, isLoading, user } = useBrolostackCIAM();
  const { hasRole, hasPermission } = usePermissions();
  
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }
  
  if (!isAuthenticated) {
    return fallback || <div>Please log in to access this content.</div>;
  }
  
  // Check role requirements
  if (requireRoles && requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return fallback || <div>Insufficient permissions. Required roles: {requireRoles.join(', ')}</div>;
    }
  }
  
  // Check permission requirements
  if (requirePermissions && requirePermissions.length > 0) {
    const hasRequiredPermissions = requirePermissions.every(perm => 
      hasPermission(perm.resource, perm.action)
    );
    if (!hasRequiredPermissions) {
      return fallback || <div>Insufficient permissions.</div>;
    }
  }
  
  // Check MFA requirement
  if (requireMFA && !user?.mfaEnabled) {
    return fallback || <div>Multi-factor authentication required.</div>;
  }
  
  return <>{children}</>;
}

// Note: BrolostackCIAMProviderProps type is defined above
