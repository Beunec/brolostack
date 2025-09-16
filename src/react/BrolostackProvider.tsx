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
}

export function BrolostackProvider({ appName, config, children }: BrolostackProviderProps) {
  const [app, setApp] = useState<BrolostackApp | null>(null);
  const [stores, setStores] = useState<Map<string, BrolostackStore>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeBrolostack = async () => {
      try {
        const brolostackApp = new Brolostack({
          appName,
          version: config?.version || '1.0.0',
          ...config
        });

        await brolostackApp.initialize();
        
        setApp(brolostackApp);
        setStores(brolostackApp.stores);
        setIsInitialized(true);
      } catch (error) {
        // Failed to initialize Brolostack - this should be handled by the application
      }
    };

    initializeBrolostack();

    return () => {
      if (app) {
        app.destroy();
      }
    };
  }, [appName, config]);

  const contextValue: BrolostackContextValue = {
    app: app!,
    stores
  };

  if (!isInitialized || !app) {
    return <div>Initializing Brolostack...</div>;
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
