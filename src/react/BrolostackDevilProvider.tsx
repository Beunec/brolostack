/**
 * 🔥 Brolostack Devil React Provider
 * Zero-knowledge security for React applications
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  BrolostackDevil, 
  getBrolostackDevil, 
  Devil,
  BrolostackDevilConfig,
  DevilSecurityLevel,
  DevilEncryptionResult 
} from '../security/BrolostackDevil';
import { Environment } from '../core/EnvironmentManager';

interface BrolostackDevilContextType {
  devil: BrolostackDevil;
  securityLevel: DevilSecurityLevel;
  isActive: boolean;
  encrypt: (data: any, userSecret: string, context: any) => Promise<DevilEncryptionResult>;
  decrypt: (encryptionResult: DevilEncryptionResult, userSecret: string, context: any) => Promise<any>;
  protectAI: (conversation: any, userSecret: string, aiProvider: string) => Promise<any>;
  protectStorage: (key: string, value: any, storageType: 'localStorage' | 'sessionStorage' | 'indexedDB') => Promise<void>;
  retrieveProtected: (key: string, storageType: 'localStorage' | 'sessionStorage' | 'indexedDB') => Promise<any>;
  forceMutation: () => Promise<void>;
  getStatus: () => any;
}

const BrolostackDevilContext = createContext<BrolostackDevilContextType | null>(null);

export interface BrolostackDevilProviderProps {
  children: ReactNode;
  config?: Partial<BrolostackDevilConfig>;
  userSecret?: string; // Optional: for automatic encryption
  enableAutoProtection?: boolean; // Automatically protect all state changes
}

export function BrolostackDevilProvider({
  children,
  config,
  userSecret,
  enableAutoProtection = false
}: BrolostackDevilProviderProps) {
  const [devil] = useState(() => getBrolostackDevil(config));
  const [securityLevel, setSecurityLevel] = useState<DevilSecurityLevel>(DevilSecurityLevel.DEVIL);
  const [isActive, setIsActive] = useState(false);
  const [mutationCount, setMutationCount] = useState(0);

  useEffect(() => {
    // Listen for devil events
    devil.on('devil-awakened', () => {
      setIsActive(true);
      console.log('🔥 BROLOSTACK DEVIL IS ACTIVE - Your data is now UNTOUCHABLE 🔥');
    });

    devil.on('patterns-mutated', (data: any) => {
      setSecurityLevel(data.securityLevel);
      setMutationCount(prev => prev + 1);
      
      if (Environment.isDev()) {
        console.log('🔥 Security patterns mutated:', {
          algorithm: data.algorithm,
          securityLevel: data.securityLevel,
          mutationCount: mutationCount + 1
        });
      }
    });

    devil.on('data-encrypted', (data: any) => {
      if (Environment.isDev()) {
        console.log('🔥 Data encrypted with devil security:', data.context.dataType);
      }
    });

    devil.on('forced-mutation', () => {
      console.log('🔥 FORCED MUTATION TRIGGERED - Security patterns changed');
    });

    return () => {
      devil.removeAllListeners();
    };
  }, [devil, mutationCount]);

  // Auto-protection for localStorage
  useEffect(() => {
    if (!enableAutoProtection || !userSecret) return;

    // Override localStorage.setItem to auto-encrypt
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      if (key.startsWith('brolostack_')) {
        // Auto-encrypt Brolostack data
        Devil.protectStorage(key, value, 'localStorage').catch(console.error);
      } else {
        originalSetItem.call(this, key, value);
      }
    };

    // Override localStorage.getItem to auto-decrypt
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = function(key: string) {
      if (key.startsWith('brolostack_')) {
        // Auto-decrypt Brolostack data
        Devil.retrieveProtected(key, 'localStorage').catch(() => null);
        return null; // Return null while decryption happens async
      } else {
        return originalGetItem.call(this, key);
      }
    };

    return () => {
      // Restore original methods
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    };
  }, [enableAutoProtection, userSecret]);

  const contextValue: BrolostackDevilContextType = {
    devil,
    securityLevel,
    isActive,
    encrypt: Devil.encrypt,
    decrypt: Devil.decrypt,
    protectAI: Devil.protectAI,
    protectStorage: Devil.protectStorage,
    retrieveProtected: Devil.retrieveProtected,
    forceMutation: Devil.mutate,
    getStatus: Devil.status
  };

  return (
    <BrolostackDevilContext.Provider value={contextValue}>
      {children}
      {Environment.isDev() && (
        <div style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          background: 'rgba(255, 0, 0, 0.1)',
          border: '2px solid red',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999
        }}>
          🔥 DEVIL ACTIVE<br/>
          Level: {securityLevel}<br/>
          Mutations: {mutationCount}<br/>
          Env: {Environment.current()}
        </div>
      )}
    </BrolostackDevilContext.Provider>
  );
}

/**
 * 🔥 Hook for using Brolostack Devil
 */
export function useBrolostackDevil() {
  const context = useContext(BrolostackDevilContext);
  
  if (!context) {
    throw new Error('useBrolostackDevil must be used within a BrolostackDevilProvider');
  }
  
  return context;
}

/**
 * 🔥 Hook for protected state management
 */
export function useDevilProtectedState<T>(
  initialValue: T,
  _userSecret: string,
  storageKey?: string
) {
  const { protectStorage, retrieveProtected } = useBrolostackDevil();
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // Load protected value on mount
  useEffect(() => {
    if (storageKey) {
      setIsLoading(true);
      retrieveProtected(storageKey, 'localStorage')
        .then((decryptedValue) => {
          if (decryptedValue !== null) {
            setValue(decryptedValue);
          }
        })
        .catch(() => {
          // If retrieval fails, use initial value
          setValue(initialValue);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [storageKey, retrieveProtected, initialValue]);

  // Protected setter
  const setProtectedValue = async (newValue: T) => {
    setValue(newValue);
    
    if (storageKey) {
      try {
        await protectStorage(storageKey, newValue, 'localStorage');
      } catch (error) {
        console.error('🔥 Failed to protect state:', error);
      }
    }
  };

  return [value, setProtectedValue, isLoading] as const;
}

/**
 * 🔥 Hook for AI conversation protection
 */
export function useDevilProtectedAI(aiProvider: string, userSecret: string) {
  const { protectAI } = useBrolostackDevil();
  const [protectedConversations, setProtectedConversations] = useState<Map<string, any>>(new Map());

  const protectConversation = async (conversation: any, conversationId: string) => {
    try {
      const result = await protectAI(conversation, userSecret, aiProvider);
      
      // Store the encrypted version
      setProtectedConversations(prev => new Map(prev).set(conversationId, result));
      
      // Return what should be sent to AI provider (jargon)
      return result.providerPayload;
    } catch (error) {
      console.error('🔥 Failed to protect AI conversation:', error);
      throw error;
    }
  };

  const getProtectedConversation = (conversationId: string) => {
    return protectedConversations.get(conversationId);
  };

  return {
    protectConversation,
    getProtectedConversation,
    protectedCount: protectedConversations.size
  };
}

/**
 * 🔥 Hook for cloud storage protection
 */
export function useDevilCloudProtection(cloudProvider: string, userId: string) {
  const { devil } = useBrolostackDevil();

  const protectForCloud = async (data: any, userSecret: string) => {
    return await devil.protectCloudStorage(data, userSecret, cloudProvider, userId);
  };

  const retrieveFromCloud = async (
    encryptedPayload: any,
    retrievalToken: string,
    userSecret: string
  ) => {
    try {
      const tokenData = JSON.parse(retrievalToken);
      const encryptionResult: DevilEncryptionResult = {
        encryptedData: encryptedPayload.devil_encrypted_data,
        token: await devil['blockchainTokens'].get(tokenData.tokenId) || {} as any,
        keyShards: [],
        obfuscationMap: {},
        mutationSeed: tokenData.mutationSeed,
        timestamp: Date.now(),
        securityFingerprint: tokenData.securityFingerprint
      };

      const context = {
        userId,
        sessionId: `cloud_${cloudProvider}_${Date.now()}`,
        dataType: 'storage' as const
      };

      return await devil.decryptClientData(encryptionResult, userSecret, context);
    } catch (error) {
      console.error('🔥 Failed to retrieve from cloud:', error);
      throw error;
    }
  };

  return {
    protectForCloud,
    retrieveFromCloud
  };
}

/**
 * 🔥 Hook for monitoring devil activity
 */
export function useDevilMonitoring() {
  const { devil, getStatus } = useBrolostackDevil();
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      setStats(getStatus());
    }, 1000);

    // Listen for devil events
    const handleEvent = (eventData: any) => {
      setEvents(prev => [
        { ...eventData, timestamp: Date.now() },
        ...prev.slice(0, 99) // Keep last 100 events
      ]);
    };

    devil.on('patterns-mutated', handleEvent);
    devil.on('data-encrypted', handleEvent);
    devil.on('data-decrypted', handleEvent);
    devil.on('token-generated', handleEvent);

    return () => {
      clearInterval(interval);
      devil.off('patterns-mutated', handleEvent);
      devil.off('data-encrypted', handleEvent);
      devil.off('data-decrypted', handleEvent);
      devil.off('token-generated', handleEvent);
    };
  }, [devil, getStatus]);

  return {
    stats,
    events,
    eventCount: events.length
  };
}
