import React, { createContext, useContext, useEffect, useState } from 'react';
// @ts-ignore
import { Brolostack as SimpleBrolostack, BrolostackConfig as SimpleBrolostackConfig, BrolostackStore as SimpleStore } from '../../src/core/Brolostack';

const BrolostackContext = createContext<{
  app: SimpleBrolostack;
  stores: Map<string, SimpleStore>;
} | null>(null);

export interface SimpleBrolostackProviderProps {
  appName: string;
  config?: Partial<SimpleBrolostackConfig>;
  children: React.ReactNode;
}

export function SimpleBrolostackProvider({ appName, config, children }: SimpleBrolostackProviderProps) {
  const [app, setApp] = useState<SimpleBrolostack | null>(null);
  const [stores, setStores] = useState<Map<string, SimpleStore>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeBrolostack = async () => {
      try {
        const brolostackApp = new SimpleBrolostack({
          appName,
          version: '1.0.0',
          ...config
        });

        await brolostackApp.initialize();
        
        setApp(brolostackApp);
        setStores(brolostackApp.stores);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize SimpleBrolostack:', error);
      }
    };

    initializeBrolostack();

    return () => {
      if (app) {
        app.destroy();
      }
    };
  }, [appName, config]);

  const contextValue = {
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

export function useSimpleBrolostack() {
  const context = useContext(BrolostackContext);
  if (!context) {
    throw new Error('useSimpleBrolostack must be used within a SimpleBrolostackProvider');
  }
  return context;
}

export function useSimpleBrolostackStore(storeName: string): SimpleStore {
  const { stores } = useSimpleBrolostack();
  const store = stores.get(storeName);
  
  if (!store) {
    throw new Error(`Store '${storeName}' not found`);
  }
  
  return store as SimpleStore;
}

export function useSimpleBrolostackState<T>(storeName: string, selector?: (state: T) => any): any {
  const store = useSimpleBrolostackStore(storeName);
  const [state, setState] = useState(() => {
    const currentState = store.getState();
    return selector ? selector(currentState) : currentState;
  });

  useEffect(() => {
    const unsubscribe = store.subscribe((newState: any) => {
      const selectedState = selector ? selector(newState) : newState;
      setState(selectedState);
    });

    return unsubscribe;
  }, [store, selector]);

  return state;
}
