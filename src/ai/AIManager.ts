/**
 * Brolostack - AI Manager
 * Manages AI agents and provides AI capabilities for the framework
 */

import { AIAgent, AIAgentConfig, AIMemory, AIMemoryEntry, AIMemoryStats, AIMultiAgentSystem } from '../types';
import { StorageAdapter } from '../types';
import { EventEmitter } from '../utils/EventEmitter';
import { nanoid } from 'nanoid';

export class AIManager {
  public agents: Map<string, AIAgent> = new Map();
  public multiAgentSystems: Map<string, AIMultiAgentSystem> = new Map();
  private memory: AIMemory;
  private isInitialized: boolean = false;

  constructor(
    private _storage: StorageAdapter,
    private eventEmitter: EventEmitter
  ) {
    this.memory = new AIMemoryImpl(_storage);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize memory
      if ('initialize' in this.memory && typeof this.memory.initialize === 'function') {
        await this.memory.initialize();
      }

      // Load existing agents from storage
      await this.loadAgents();

      this.isInitialized = true;
      // Log initialization success through event emitter
      this.eventEmitter.emit('ai:manager:initialized', { timestamp: Date.now() });
    } catch (error) {
      throw new Error(`Failed to initialize AI Manager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  createAgent(config: AIAgentConfig): AIAgent {
    const agent = new AIAgentImpl(config, this.memory, this.eventEmitter);
    this.agents.set(agent.id, agent);
    
    // Save agent to storage
    this.saveAgent(agent);
    
    this.eventEmitter.emit('ai:agent:created', { agentId: agent.id, config });
    return agent;
  }

  getAgent(id: string): AIAgent | undefined {
    return this.agents.get(id);
  }

  removeAgent(id: string): boolean {
    const agent = this.agents.get(id);
    if (agent) {
      this.agents.delete(id);
      this._storage.removeItem(`ai_agent_${id}`);
      this.eventEmitter.emit('ai:agent:removed', { agentId: id });
      return true;
    }
    return false;
  }

  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  async exportMemory(): Promise<Record<string, any>> {
    if ('export' in this.memory && typeof this.memory.export === 'function') {
      return await this.memory.export() || {};
    }
    return {};
  }

  async importMemory(data: Record<string, any>): Promise<void> {
    if ('import' in this.memory && typeof this.memory.import === 'function') {
      await this.memory.import(data);
    }
  }

  async storeMemory(key: string, value: any, type: 'conversation' | 'context' | 'knowledge' | 'preference' = 'context', importance: number = 0.5): Promise<void> {
    // Create a structured memory entry
    const memoryEntry = {
      value,
      type,
      importance,
      timestamp: Date.now()
    };
    await this.memory.store(key, memoryEntry);
  }

  async clearMemory(): Promise<void> {
    this.memory.clear();
  }

  getMemoryStats(): AIMemoryStats {
    if ('getStats' in this.memory && typeof this.memory.getStats === 'function') {
      return this.memory.getStats();
    }
    return {
      totalEntries: 0,
      totalSize: 0,
      averageImportance: 0,
      entriesByType: {}
    };
  }

  private async loadAgents(): Promise<void> {
    try {
      const keys = await this._storage.keys();
      const agentKeys = keys.filter(key => key.startsWith('ai_agent_'));

      for (const key of agentKeys) {
        const agentData = await this._storage.getItem(key);
        if (agentData) {
          const config = JSON.parse(agentData);
          const agent = new AIAgentImpl(config, this.memory, this.eventEmitter);
          this.agents.set(agent.id, agent);
        }
      }
    } catch (error) {
      this.eventEmitter.emit('ai:manager:load-agents-error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }

  private async saveAgent(agent: AIAgent): Promise<void> {
    try {
      const config = {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        config: agent.config,
        state: (agent as any).state
      };
      await this._storage.setItem(`ai_agent_${agent.id}`, JSON.stringify(config));
    } catch (error) {
      this.eventEmitter.emit('ai:manager:save-agent-error', { 
        agentId: agent.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }
}

/**
 * AI Agent Implementation
 */
class AIAgentImpl implements AIAgent {
  public id: string;
  public name: string;
  public type: 'llm' | 'multi-agent' | 'custom';
  public config: AIAgentConfig;
  public memory: AIMemory;
  public state: any = {
    isActive: false,
    isProcessing: false,
    lastActivity: 0,
    totalRequests: 0,
    totalTokens: 0,
    errors: []
  };

  constructor(
    config: AIAgentConfig,
    memory: AIMemory,
    private eventEmitter: EventEmitter
  ) {
    this.id = config.id || nanoid();
    this.name = config.name;
    this.type = config.type;
    this.config = config;
    this.memory = memory;
  }

  async execute(prompt: string, context?: any): Promise<any> {
    this.state.isProcessing = true;
    this.state.lastActivity = Date.now();

    try {
      // Store the interaction in memory
      await this.memory.store(`interaction_${Date.now()}`, {
        prompt,
        context,
        timestamp: Date.now(),
        agentId: this.id
      });

      // Execute based on agent type
      let result: any;
      switch (this.type) {
        case 'llm':
          result = await this.executeLLM(prompt, context);
          break;
        case 'multi-agent':
          result = await this.executeMultiAgent(prompt, context);
          break;
        case 'custom':
          result = await this.executeCustom(prompt, context);
          break;
        default:
          throw new Error(`Unknown agent type: ${this.type}`);
      }

      this.state.totalRequests++;
      this.state.isProcessing = false;

      this.eventEmitter.emit('ai:agent:executed', {
        agentId: this.id,
        prompt,
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      this.state.isProcessing = false;
      this.state.errors.push({
        id: nanoid(),
        timestamp: Date.now(),
        type: 'execution',
        message: error instanceof Error ? error.message : 'Unknown error',
        context: { prompt, context },
        retryable: true
      });

      this.eventEmitter.emit('ai:agent:error', {
        agentId: this.id,
        error,
        timestamp: Date.now()
      });

      throw error;
    }
  }

  addTool(tool: any): void {
    if (!this.config.tools) {
      this.config.tools = [];
    }
    this.config.tools.push(tool);
  }

  removeTool(toolName: string): void {
    if (this.config.tools) {
      this.config.tools = this.config.tools.filter(tool => tool.function.name !== toolName);
    }
  }

  clearMemory(): void {
    this.memory.clear();
  }

  getMemoryStats(): AIMemoryStats {
    if ('getStats' in this.memory && typeof this.memory.getStats === 'function') {
      return this.memory.getStats();
    }
    return {
      totalEntries: 0,
      totalSize: 0,
      averageImportance: 0,
      entriesByType: {}
    };
  }

  private async executeLLM(prompt: string, _context?: any): Promise<any> {
    // This would integrate with actual LLM providers
    // For now, return a mock response
    return {
      response: `AI Agent "${this.name}" processed: ${prompt}`,
      tokens: prompt.length,
      timestamp: Date.now()
    };
  }

  private async executeMultiAgent(prompt: string, _context?: any): Promise<any> {
    // Multi-agent execution logic
    return {
      response: `Multi-agent system "${this.name}" processed: ${prompt}`,
      agents: [],
      timestamp: Date.now()
    };
  }

  private async executeCustom(prompt: string, _context?: any): Promise<any> {
    // Custom execution logic
    return {
      response: `Custom agent "${this.name}" processed: ${prompt}`,
      timestamp: Date.now()
    };
  }
}

/**
 * AI Memory Implementation
 */
class AIMemoryImpl implements AIMemory {
  public entries: Map<string, AIMemoryEntry> = new Map();
  public maxSize: number = 1000;
  public strategy: 'fifo' | 'lru' | 'importance' = 'lru';

  constructor(private _storage: StorageAdapter) {}

  async initialize(): Promise<void> {
    await this.loadFromStorage();
  }

  async store(key: string, value: any, type: 'conversation' | 'context' | 'knowledge' | 'preference' = 'context', importance: number = 0.5): Promise<void> {
    const entry: AIMemoryEntry = {
      id: key,
      timestamp: Date.now(),
      type: type,
      content: value,
      importance,
      tags: [],
      metadata: {}
    };

    this.entries.set(key, entry);

    // Check if we need to cleanup
    if (this.entries.size > this.maxSize) {
      await this.cleanup();
    }

    // Save to storage
    await this._storage.setItem(`ai_memory_${key}`, JSON.stringify(entry));
  }

  async retrieve(key: string): Promise<AIMemoryEntry | undefined> {
    let entry = this.entries.get(key);
    
    if (!entry) {
      // Try to load from storage
      const stored = await this._storage.getItem(`ai_memory_${key}`);
      if (stored) {
        entry = JSON.parse(stored);
        if (entry) {
          this.entries.set(key, entry);
        }
      }
    }

    return entry;
  }

  async search(query: string, type?: string, limit: number = 10): Promise<AIMemoryEntry[]> {
    const results: AIMemoryEntry[] = [];
    
    for (const entry of this.entries.values()) {
      if (type && entry.type !== type) continue;
      
      // Simple text search in content
      if (JSON.stringify(entry.content).toLowerCase().includes(query.toLowerCase())) {
        results.push(entry);
      }
      
      if (results.length >= limit) break;
    }

    // Sort by relevance (importance + recency)
    return results.sort((a, b) => {
      const scoreA = a.importance + (Date.now() - a.timestamp) / (1000 * 60 * 60 * 24); // Days
      const scoreB = b.importance + (Date.now() - b.timestamp) / (1000 * 60 * 60 * 24);
      return scoreB - scoreA;
    });
  }

  async clear(): Promise<void> {
    this.entries.clear();
    
    // Clear from storage
    const keys = await this._storage.keys();
    const memoryKeys = keys.filter((key: string) => key.startsWith('ai_memory_'));
    
    for (const key of memoryKeys) {
      await this._storage.removeItem(key);
    }
  }

  async getAll(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    for (const [key, entry] of this.entries) {
      data[key] = entry;
    }
    return data;
  }

  getStats(): AIMemoryStats {
    const entries = Array.from(this.entries.values());
    const totalSize = entries.reduce((sum, entry) => sum + JSON.stringify(entry).length, 0);
    const averageImportance = entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.importance, 0) / entries.length : 0;
    
    const entriesByType: Record<string, number> = {};
    for (const entry of entries) {
      entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
    }

    const sortedByTime = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    const sortedByTimeDesc = [...entries].sort((a, b) => b.timestamp - a.timestamp);

    return {
      totalEntries: entries.length,
      totalSize,
      averageImportance,
      oldestEntry: sortedByTime[0] || undefined,
      newestEntry: sortedByTimeDesc[0] || undefined,
      entriesByType
    };
  }

  async cleanup(): Promise<void> {
    const entries = Array.from(this.entries.values());
    
    // Sort by strategy
    let sortedEntries: AIMemoryEntry[];
    switch (this.strategy) {
      case 'fifo':
        sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'lru':
        sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'importance':
        sortedEntries = entries.sort((a, b) => a.importance - b.importance);
        break;
      default:
        sortedEntries = entries;
    }

    // Remove oldest/least important entries
    const toRemove = sortedEntries.slice(0, Math.floor(this.maxSize * 0.1)); // Remove 10%
    
    for (const entry of toRemove) {
      this.entries.delete(entry.id);
      await this._storage.removeItem(`ai_memory_${entry.id}`);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const keys = await this._storage.keys();
      const memoryKeys = keys.filter((key: string) => key.startsWith('ai_memory_'));

      for (const key of memoryKeys) {
        const stored = await this._storage.getItem(key);
        if (stored) {
          const entry = JSON.parse(stored);
          this.entries.set(entry.id, entry);
        }
      }
    } catch (error) {
      // Memory load error - could emit event if eventEmitter was available
    }
  }

  async export(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    for (const [key, entry] of this.entries) {
      data[key] = entry;
    }
    return data;
  }

  async import(data: Record<string, any>): Promise<void> {
    for (const [key, entry] of Object.entries(data)) {
      this.entries.set(key, entry);
      await this._storage.setItem(`ai_memory_${key}`, JSON.stringify(entry));
    }
  }
}
