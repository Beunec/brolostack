/**
 * Brolostack - React Integration
 * React provider and hooks for Brolostack
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrolostackApp, BrolostackStore, BrolostackConfig, BrolostackContextValue } from '../types';
import { Brolostack } from '../core/Brolostack';

const BrolostackContext = createContext<BrolostackContextValue | null>(null);

export interface BrolostackProviderProps {
  appName: string;
  config?: Partial<BrolostackConfig>;
  children: ReactNode;
  // SSR/SSG Support
  initialData?: Record<string, any>;
  ssrMode?: 'ssr' | 'ssg' | 'hybrid' | 'client';
  hydrationStrategy?: 'immediate' | 'lazy' | 'on-demand';
}

export function BrolostackProvider({ 
  appName, 
  config, 
  children, 
  initialData, 
  ssrMode = 'client', 
  hydrationStrategy = 'immediate' 
}: BrolostackProviderProps) {
  const [app, setApp] = useState<BrolostackApp | null>(null);
  const [stores, setStores] = useState<Map<string, BrolostackStore>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(ssrMode === 'client');

  useEffect(() => {
    const initializeBrolostack = async () => {
      try {
        const enhancedConfig = {
          appName,
          version: config?.version || '1.0.0',
          ...config,
          enterprise: {
            ...config?.enterprise,
            mrm: {
              enabled: ssrMode !== 'client',
              mode: ssrMode === 'client' ? 'ssr' : ssrMode,
              hydration: {
                strategy: hydrationStrategy
              },
              ...config?.enterprise?.mrm
            }
          }
        };

        const brolostackApp = new Brolostack(enhancedConfig);

        await brolostackApp.initialize();
        
        // Hydrate with initial data if provided (SSR/SSG)
        if (initialData && Object.keys(initialData).length > 0) {
          await brolostackApp.importData(initialData);
        }
        
        setApp(brolostackApp);
        setStores(brolostackApp.stores);
        setIsInitialized(true);
        
        // Handle hydration strategy
        if (ssrMode !== 'client') {
          await handleHydration(hydrationStrategy);
        }
      } catch (error) {
        console.error('Failed to initialize Brolostack:', error);
      }
    };

    initializeBrolostack();

    return () => {
      if (app) {
        app.destroy();
      }
    };
  }, [appName, config, ssrMode, hydrationStrategy, initialData]);

  const handleHydration = async (strategy: string) => {
    try {
      switch (strategy) {
        case 'immediate':
          setIsHydrated(true);
          break;
        case 'lazy':
          // Hydrate after a short delay
          setTimeout(() => setIsHydrated(true), 100);
          break;
        case 'on-demand':
          // Hydrate only when user interacts
          const handleInteraction = () => {
            setIsHydrated(true);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('scroll', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
          };
          document.addEventListener('click', handleInteraction);
          document.addEventListener('scroll', handleInteraction);
          document.addEventListener('keydown', handleInteraction);
          break;
        default:
          setIsHydrated(true);
      }
    } catch (error) {
      console.error('Hydration failed:', error);
      setIsHydrated(true); // Fallback to hydrated state
    }
  };

  const contextValue: BrolostackContextValue = {
    app: app!,
    stores
  };

  if (!isInitialized || !app) {
    return <div>Initializing Brolostack...</div>;
  }

  if (ssrMode !== 'client' && !isHydrated) {
    return (
      <BrolostackContext.Provider value={{ app, stores }}>
        <div suppressHydrationWarning={true}>
          {children}
        </div>
      </BrolostackContext.Provider>
    );
  }

  return (
    <BrolostackContext.Provider value={contextValue}>
      {children}
    </BrolostackContext.Provider>
  );
}

export function useBrolostack(): BrolostackContextValue {
  const context = useContext(BrolostackContext);
  if (!context) {
    throw new Error('useBrolostack must be used within a BrolostackProvider');
  }
  return context;
}

export function useBrolostackStore<T>(storeName: string): BrolostackStore<T> {
  const { stores } = useBrolostack();
  const store = stores.get(storeName);
  
  if (!store) {
    throw new Error(`Store '${storeName}' not found`);
  }
  
  return store as BrolostackStore<T>;
}

export function useBrolostackState<T>(storeName: string, selector?: (state: T) => any): any {
  const store = useBrolostackStore<T>(storeName);
  const [state, setState] = useState(() => {
    const currentState = store.getState();
    return selector ? selector(currentState) : currentState;
  });

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      const selectedState = selector ? selector(newState) : newState;
      setState(selectedState);
    });

    return unsubscribe;
  }, [store, selector]);

  return state;
}

// Enterprise Feature Hooks

/**
 * Hook to access authentication features
 */
export function useBrolostackAuth() {
  const { app } = useBrolostack();
  
  if (!(app as any).auth) {
    throw new Error('Authentication not enabled. Enable auth in enterprise config.');
  }
  
  return (app as any).auth;
}

/**
 * Hook to access real-time features
 */
export function useBrolostackRealtime() {
  const { app } = useBrolostack();
  
  if (!(app as any).realtime) {
    throw new Error('Real-time features not enabled. Enable realtime in enterprise config.');
  }
  
  return (app as any).realtime;
}

/**
 * Hook to access MRM (Multi-Rendering Mode) features
 */
export function useBrolostackMRM() {
  const { app } = useBrolostack();
  
  if (!(app as any).ssr) {
    throw new Error('MRM not enabled. Enable mrm in enterprise config.');
  }
  
  return (app as any).ssr;
}

/**
 * Hook to access security features
 */
export function useBrolostackSecurity() {
  const { app } = useBrolostack();
  
  if (!(app as any).security) {
    throw new Error('Security features not enabled. Enable security in enterprise config.');
  }
  
  return (app as any).security;
}

/**
 * Hook to access provider management
 */
export function useBrolostackProviders() {
  const { app } = useBrolostack();
  
  if (!(app as any).providers) {
    throw new Error('Provider management not enabled. Enable providers in enterprise config.');
  }
  
  return (app as any).providers;
}

/**
 * Hook to access cloud integration
 */
export function useBrolostackCloud() {
  const { app } = useBrolostack();
  
  if (!(app as any).cloud) {
    throw new Error('Cloud integration not enabled. Enable cloud in enterprise config.');
  }
  
  return (app as any).cloud;
}

/**
 * Hook to check enterprise feature availability
 */
export function useBrolostackEnterprise() {
  const { app } = useBrolostack();
  
  return {
    isEnabled: (app as any).hasEnterpriseFeatures?.() || false,
    status: (app as any).getEnterpriseStatus?.() || { enabled: false, features: [], version: '1.0.2' },
    features: {
      auth: !!(app as any).auth,
      realtime: !!(app as any).realtime,
      mrm: !!(app as any).ssr,
      worker: !!(app as any).worker,
      security: !!(app as any).security,
      providers: !!(app as any).providers,
      cloud: !!(app as any).cloud
    }
  };
}
