/**
 * Brolostack - AI Manager
 * Manages AI agents and provides AI capabilities for the framework
 */
import { AIAgent, AIAgentConfig, AIMemoryStats, AIMultiAgentSystem } from '../types';
import { StorageAdapter } from '../types';
import { EventEmitter } from '../utils/EventEmitter';
export declare class AIManager {
    private _storage;
    private eventEmitter;
    agents: Map<string, AIAgent>;
    multiAgentSystems: Map<string, AIMultiAgentSystem>;
    private memory;
    private isInitialized;
    constructor(_storage: StorageAdapter, eventEmitter: EventEmitter);
    initialize(): Promise<void>;
    createAgent(config: AIAgentConfig): AIAgent;
    getAgent(id: string): AIAgent | undefined;
    removeAgent(id: string): boolean;
    getAllAgents(): AIAgent[];
    exportMemory(): Promise<Record<string, any>>;
    importMemory(data: Record<string, any>): Promise<void>;
    storeMemory(key: string, value: any, type?: 'conversation' | 'context' | 'knowledge' | 'preference', importance?: number): Promise<void>;
    clearMemory(): Promise<void>;
    getMemoryStats(): AIMemoryStats;
    private loadAgents;
    private saveAgent;
}
//# sourceMappingURL=AIManager.d.ts.map