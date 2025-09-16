/**
 * Brolostack - Core Framework Class
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 * 
 * This is the unified, production-ready core implementation that combines
 * the full-featured capabilities with simplified, reliable functionality.
 */

import { BrolostackConfig, BrolostackApp, BrolostackStore, StorageAdapter, BrolostackAPI, AIAgent, BrolostackError } from '../types';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';
import { LocalAPI } from '../api/LocalAPI';
import { AIManager } from '../ai/AIManager';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';

export class Brolostack implements BrolostackApp {
  public readonly config: BrolostackConfig;
  public readonly storage: StorageAdapter;
  public readonly api: BrolostackAPI;
  public readonly stores: Map<string, BrolostackStore>;
  public readonly ai: {
    agents: Map<string, AIAgent>;
    createAgent(config: any): AIAgent;
    getAgent(id: string): AIAgent | undefined;
    removeAgent(id: string): void;
    runAgent(id: string, input: any): Promise<any>;
    getMemory(): any;
    storeMemory(key: string, value: any, type?: string, importance?: number): Promise<void>;
    clearMemory(): Promise<void>;
    getMemoryStats(): any;
  };
  
  private readonly eventEmitter: EventEmitter;
  private readonly logger: Logger;
  private readonly aiManager: AIManager;
  private isInitialized: boolean = false;
  private startTime: number = Date.now();

  constructor(config: BrolostackConfig) {
    this.config = {
      storageEngine: 'localStorage',
      encryption: false,
      compression: false,
      maxStorageSize: 100, // 100MB default
      debug: false,
      ...config
    };

    this.logger = new Logger(this.config.debug);
    this.eventEmitter = new EventEmitter();
    this.stores = new Map();
    
    // Initialize storage adapter
    this.storage = new LocalStorageAdapter({
      name: this.config.appName,
      version: parseInt(this.config.version) || 1,
      size: this.config.maxStorageSize || 50 * 1024 * 1024
    });

    // Initialize local API
    this.api = new LocalAPI(this.storage) as any;

    // Initialize AI manager
    this.aiManager = new AIManager(this.storage, this.eventEmitter);
    this.ai = {
      agents: this.aiManager.agents,
      createAgent: (config: any) => this.aiManager.createAgent(config),
      getAgent: (id: string) => this.aiManager.getAgent(id),
      removeAgent: (id: string) => this.aiManager.removeAgent(id),
      runAgent: async (id: string, input: any) => {
        const agent = this.aiManager.getAgent(id);
        if (!agent) throw new Error(`Agent ${id} not found`);
        return await agent.execute(input);
      },
      getMemory: async () => {
        return await this.aiManager.exportMemory();
      },
      storeMemory: async (key: string, value: any, type?: string, importance?: number) => {
        return await this.aiManager.storeMemory(key, value, type as any, importance);
      },
      clearMemory: async () => {
        return await this.aiManager.clearMemory();
      },
      getMemoryStats: () => {
        return this.aiManager.getMemoryStats();
      }
    };

    this.logger.info('Brolostack initialized', { appName: this.config.appName, version: this.config.version });
  }

  /**
   * Initialize the Brolostack framework
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Brolostack already initialized');
      return;
    }

    try {
      // Initialize storage
      if ('initialize' in this.storage && typeof this.storage.initialize === 'function') {
        await this.storage.initialize();
      }

      // Initialize AI manager
      await this.aiManager.initialize();

      // Emit initialization event
      this.eventEmitter.emit('initialized', { appName: this.config.appName, version: this.config.version });

      this.isInitialized = true;
      this.logger.info('Brolostack initialization completed');
    } catch (error) {
      const brolostackError: BrolostackError = {
        name: 'BrolostackInitializationError',
        message: `Failed to initialize Brolostack: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INITIALIZATION_FAILED',
        context: { config: this.config },
        timestamp: Date.now()
      };
      
      this.logger.error('Brolostack initialization failed', brolostackError);
      throw brolostackError;
    }
  }

  /**
   * Create a new store
   */
  createStore<T>(name: string, initialState: T): BrolostackStore<T> {
    if (this.stores.has(name)) {
      this.logger.warn(`Store '${name}' already exists, returning existing store`);
      return this.stores.get(name) as BrolostackStore<T>;
    }

    const store = new BrolostackStoreImpl<T>(name, initialState, this.storage, this.eventEmitter);
    this.stores.set(name, store);

    this.logger.info(`Store '${name}' created`, { initialState });
    this.eventEmitter.emit('store:created', { name, initialState });

    return store;
  }

  /**
   * Get an existing store
   */
  getStore<T>(name: string): BrolostackStore<T> | undefined {
    return this.stores.get(name) as BrolostackStore<T> | undefined;
  }

  /**
   * Remove a store
   */
  removeStore(name: string): boolean {
    const store = this.stores.get(name);
    if (store) {
      store.clear();
      this.stores.delete(name);
      this.logger.info(`Store '${name}' removed`);
      this.eventEmitter.emit('store:removed', { name });
      return true;
    }
    return false;
  }

  /**
   * Get all store names
   */
  getStoreNames(): string[] {
    return Array.from(this.stores.keys());
  }

  /**
   * Clear all stores
   */
  clearAllStores(): void {
    this.stores.forEach((store, name) => {
      store.clear();
      this.logger.info(`Store '${name}' cleared`);
    });
    this.eventEmitter.emit('stores:cleared', { count: this.stores.size });
  }

  /**
   * Export all data from stores and AI memory
   */
  async exportData(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    
    // Export store data
    for (const [name, store] of this.stores) {
      data[name] = store.getState();
    }

    // Export AI memory
    data['_aiMemory'] = await this.aiManager.exportMemory();

    // Export metadata
    data['_metadata'] = {
      appName: this.config.appName,
      version: this.config.version,
      exportDate: new Date().toISOString(),
      storeCount: this.stores.size,
      aiAgentCount: this.ai.agents.size
    };

    this.logger.info('Data exported', { 
      storeCount: this.stores.size, 
      aiAgentCount: this.ai.agents.size 
    });
    
    this.eventEmitter.emit('data:exported', { 
      storeCount: this.stores.size,
      aiAgentCount: this.ai.agents.size 
    });

    return data;
  }

  /**
   * Import data into stores and AI memory
   */
  async importData(data: Record<string, any>): Promise<void> {
    try {
      // Import store data
      for (const [name, storeData] of Object.entries(data)) {
        if (name.startsWith('_')) continue;

        let store = this.stores.get(name);
        if (!store) {
          store = this.createStore(name, storeData);
        } else {
          store.setState(storeData);
        }
      }

      // Import AI memory
      if (data['_aiMemory']) {
        await this.aiManager.importMemory(data['_aiMemory']);
      }

      this.logger.info('Data imported successfully', { 
        storeCount: Object.keys(data).filter(k => !k.startsWith('_')).length 
      });
      
      this.eventEmitter.emit('data:imported', { 
        storeCount: Object.keys(data).filter(k => !k.startsWith('_')).length 
      });
    } catch (error) {
      this.logger.error('Data import failed:', error);
      throw error;
    }
  }

  /**
   * Get framework statistics
   */
  getStats(): {
    stores: number;
    aiAgents: number;
    storageSize: number;
    uptime: number;
    version: string;
  } {
    return {
      stores: this.stores.size,
      aiAgents: this.ai.agents.size,
      storageSize: ('getSize' in this.storage && typeof this.storage.getSize === 'function') ? this.storage.getSize() : 0,
      uptime: Date.now() - this.startTime,
      version: this.config.version
    };
  }

  /**
   * Persist all stores to storage
   */
  persist(config?: any): void {
    this.stores.forEach((store, _name) => {
      if ('persist' in store && typeof store.persist === 'function') {
        (store as any).persist(config);
      }
    });
    this.logger.info('All stores persisted');
    this.eventEmitter.emit('stores:persisted', { count: this.stores.size });
  }

  /**
   * Destroy the Brolostack instance
   */
  destroy(): void {
    this.logger.info('Destroying Brolostack instance');
    
    // Clear all stores
    this.clearAllStores();
    
    // Clear AI memory
    this.ai.clearMemory();
    
    // Emit destruction event
    this.eventEmitter.emit('destroyed', { 
      appName: this.config.appName,
      version: this.config.version 
    });
    
    this.isInitialized = false;
    this.logger.info('Brolostack instance destroyed');
  }

  /**
   * Get the event emitter for custom event handling
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Get the logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }
}

/**
 * Brolostack Store Implementation
 */
class BrolostackStoreImpl<T> implements BrolostackStore<T> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();
  private isPersisted: boolean = false;
  private persistConfig: any = null;

  constructor(
    private name: string,
    initialState: T,
    private storage: StorageAdapter,
    private eventEmitter: EventEmitter
  ) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(partial: Partial<T>): void {
    const oldState = this.state;
    this.state = { ...this.state, ...partial };
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.state));
    
    // Emit store update event
    this.eventEmitter.emit('store:updated', {
      name: this.name,
      oldState,
      newState: this.state
    });

    // Auto-persist if enabled
    if (this.isPersisted) {
      this.saveToStorage();
    }
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  persist(config?: any): void {
    this.persistConfig = config;
    this.isPersisted = true;
    this.saveToStorage();
  }

  private async saveToStorage(): Promise<void> {
    try {
      await this.storage.setItem(`store:${this.name}`, JSON.stringify({
        state: this.state,
        config: this.persistConfig,
        timestamp: Date.now()
      }));
    } catch (error) {
      (this as any).logger.error(`Failed to persist store '${this.name}'`, error);
    }
  }

  async loadFromStorage(): Promise<void> {
    try {
      const data = await this.storage.getItem(`store:${this.name}`);
      if (data && typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object' && 'state' in parsed) {
          this.state = parsed.state as T;
          this.persistConfig = parsed.config;
          this.isPersisted = true;
        }
      }
    } catch (error) {
      (this as any).logger.error(`Failed to load store '${this.name}'`, error);
    }
  }

  clear(): void {
    this.state = {} as T;
    this.listeners.clear();
    this.isPersisted = false;
    this.persistConfig = null;
    
    // Remove from storage
    this.storage.removeItem(`store:${this.name}`);
    
    this.eventEmitter.emit('store:cleared', { name: this.name });
  }

  reset(): void {
    // Reset to initial state (this would need to be stored)
    this.state = {} as T;
    this.listeners.clear();
    this.isPersisted = false;
    this.persistConfig = null;
    
    // Remove from storage
    this.storage.removeItem(`store:${this.name}`);
    
    this.eventEmitter.emit('store:reset', { name: this.name });
  }
}

// Export the main class as default
export default Brolostack;