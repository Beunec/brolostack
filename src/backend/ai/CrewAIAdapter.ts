/**
 * CrewAI Framework Adapter for Brolostack
 * Provides seamless integration with CrewAI for role-based multi-agent AI applications
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface CrewAIConfig {
  backendURL: string;
  defaultLLM?: {
    provider: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' 
             | 'huggingface' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' 
             | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' 
             | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi' | 'local';
    model: string;
    apiKey?: string;
    endpoint?: string;
    region?: string;
  };
  memory?: {
    enabled: boolean;
    provider: 'local' | 'redis' | 'chromadb';
    config?: Record<string, any>;
  };
  tools?: {
    enabled: string[];
    custom?: CrewAITool[];
  };
}

export interface CrewAIAgent {
  role: string;
  goal: string;
  backstory: string;
  tools?: string[];
  llm?: {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  memory?: boolean;
  verbose?: boolean;
  allowDelegation?: boolean;
  maxIter?: number;
  maxExecutionTime?: number;
}

export interface CrewAITask {
  description: string;
  expectedOutput: string;
  agent?: string;
  tools?: string[];
  async?: boolean;
  context?: string[];
  outputFile?: string;
  outputJson?: any;
  callback?: string;
}

export interface CrewAICrew {
  id: string;
  name: string;
  agents: CrewAIAgent[];
  tasks: CrewAITask[];
  process: 'sequential' | 'hierarchical';
  verbose?: boolean;
  memory?: boolean;
  cache?: boolean;
  maxRpm?: number;
  language?: string;
  fullOutput?: boolean;
  stepCallback?: string;
  taskCallback?: string;
}

export interface CrewAITool {
  name: string;
  description: string;
  parameters?: Record<string, any>;
  implementation: string; // Python code
  requirements?: string[]; // Python packages needed
}

export interface CrewAIExecution {
  id: string;
  crewId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  results?: {
    tasks: Array<{
      task: string;
      output: string;
      agent: string;
      executionTime: number;
    }>;
    finalOutput: string;
    totalExecutionTime: number;
  };
  error?: string;
  logs?: string[];
}

export class CrewAIAdapter extends EventEmitter {
  private config: CrewAIConfig;
  private logger: Logger;
  private connected = false;
  private crews: Map<string, CrewAICrew> = new Map();
  private executions: Map<string, CrewAIExecution> = new Map();
  private tools: Map<string, CrewAITool> = new Map();

  constructor(config: CrewAIConfig) {
    super();
    this.config = config;
    this.logger = new Logger(false, 'CrewAIAdapter');
    this.initializeDefaultTools();
  }

  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/health`);
      
      if (response.ok) {
        this.connected = true;
        this.emit('connected', { adapter: 'crewai' });
        this.logger.info('Connected to CrewAI backend');
        
        // Register custom tools if any
        if (this.config.tools?.custom) {
          for (const tool of this.config.tools.custom) {
            await this.registerTool(tool);
          }
        }
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to connect to CrewAI backend:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: 'crewai' });
    this.logger.info('Disconnected from CrewAI backend');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Agent Management
  async createAgent(agentConfig: CrewAIAgent): Promise<string> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/agents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...agentConfig,
          llm: agentConfig.llm || this.config.defaultLLM
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.statusText}`);
      }

      const result = await response.json();
      const agentId = result.agent_id;
      this.emit('agent-created', { agentId, config: agentConfig });
      return agentId;
    } catch (error) {
      this.logger.error('Failed to create agent:', error);
      throw error;
    }
  }

  async updateAgent(agentId: string, updates: Partial<CrewAIAgent>): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update agent: ${response.statusText}`);
      }

      this.emit('agent-updated', { agentId, updates });
    } catch (error) {
      this.logger.error('Failed to update agent:', error);
      throw error;
    }
  }

  // Task Management
  async createTask(taskConfig: CrewAITask): Promise<string> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/tasks/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      const result = await response.json();
      const taskId = result.task_id;
      this.emit('task-created', { taskId, config: taskConfig });
      return taskId;
    } catch (error) {
      this.logger.error('Failed to create task:', error);
      throw error;
    }
  }

  // Crew Management
  async createCrew(crewConfig: Omit<CrewAICrew, 'id'>): Promise<CrewAICrew> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/crews/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...crewConfig,
          memory: crewConfig.memory || this.config.memory?.enabled,
          cache: crewConfig.cache !== false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create crew: ${response.statusText}`);
      }

      const crew = await response.json();
      this.crews.set(crew.id, crew);
      this.emit('crew-created', { crew });
      return crew;
    } catch (error) {
      this.logger.error('Failed to create crew:', error);
      throw error;
    }
  }

  async kickoffCrew(
    crewId: string,
    inputs?: Record<string, any>
  ): Promise<CrewAIExecution> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/crews/${crewId}/kickoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs })
      });

      if (!response.ok) {
        throw new Error(`Failed to kickoff crew: ${response.statusText}`);
      }

      const execution = await response.json();
      this.executions.set(execution.id, execution);
      this.emit('crew-kickoff', { crewId, execution });
      return execution;
    } catch (error) {
      this.logger.error('Failed to kickoff crew:', error);
      throw error;
    }
  }

  async getCrewExecution(executionId: string): Promise<CrewAIExecution | null> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/executions/${executionId}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get execution: ${response.statusText}`);
      }

      const execution = await response.json();
      this.executions.set(executionId, execution);
      return execution;
    } catch (error) {
      this.logger.error('Failed to get crew execution:', error);
      throw error;
    }
  }

  async cancelCrewExecution(executionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/executions/${executionId}/cancel`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel execution: ${response.statusText}`);
      }

      const execution = this.executions.get(executionId);
      if (execution) {
        execution.status = 'cancelled';
      }

      this.emit('execution-cancelled', { executionId });
    } catch (error) {
      this.logger.error('Failed to cancel execution:', error);
      throw error;
    }
  }

  // Tool Management
  async registerTool(tool: CrewAITool): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/tools/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tool)
      });

      if (!response.ok) {
        throw new Error(`Failed to register tool: ${response.statusText}`);
      }

      this.tools.set(tool.name, tool);
      this.emit('tool-registered', { tool });
    } catch (error) {
      this.logger.error('Failed to register tool:', error);
      throw error;
    }
  }

  async getAvailableTools(): Promise<CrewAITool[]> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/tools`);
      
      if (!response.ok) {
        throw new Error(`Failed to get tools: ${response.statusText}`);
      }

      const tools = await response.json();
      
      // Update local tools map
      tools.forEach((tool: CrewAITool) => {
        this.tools.set(tool.name, tool);
      });

      return tools;
    } catch (error) {
      this.logger.error('Failed to get available tools:', error);
      throw error;
    }
  }

  // Memory Management
  async storeMemory(key: string, value: any, metadata?: Record<string, any>): Promise<void> {
    if (!this.config.memory?.enabled) {
      throw new Error('Memory is not enabled for this CrewAI adapter');
    }

    try {
      const response = await fetch(`${this.config.backendURL}/api/memory/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value,
          metadata,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to store memory: ${response.statusText}`);
      }

      this.emit('memory-stored', { key, value, metadata });
    } catch (error) {
      this.logger.error('Failed to store memory:', error);
      throw error;
    }
  }

  async retrieveMemory(key: string): Promise<any> {
    if (!this.config.memory?.enabled) {
      throw new Error('Memory is not enabled for this CrewAI adapter');
    }

    try {
      const response = await fetch(`${this.config.backendURL}/api/memory/${key}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to retrieve memory: ${response.statusText}`);
      }

      const data = await response.json();
      this.emit('memory-retrieved', { key, data });
      return data.value;
    } catch (error) {
      this.logger.error('Failed to retrieve memory:', error);
      throw error;
    }
  }

  async searchMemory(query: string, limit = 10): Promise<any[]> {
    if (!this.config.memory?.enabled) {
      throw new Error('Memory is not enabled for this CrewAI adapter');
    }

    try {
      const response = await fetch(`${this.config.backendURL}/api/memory/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit })
      });

      if (!response.ok) {
        throw new Error(`Failed to search memory: ${response.statusText}`);
      }

      const results = await response.json();
      this.emit('memory-searched', { query, results });
      return results;
    } catch (error) {
      this.logger.error('Failed to search memory:', error);
      throw error;
    }
  }

  // Training and Learning
  async trainCrew(crewId: string, trainingData: {
    scenarios: Array<{
      inputs: Record<string, any>;
      expectedOutputs: Record<string, any>;
      feedback?: string;
    }>;
    iterations?: number;
    validationSplit?: number;
  }): Promise<{
    trainingId: string;
    status: 'started' | 'completed' | 'failed';
  }> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/crews/${crewId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData)
      });

      if (!response.ok) {
        throw new Error(`Failed to start training: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('training-started', { crewId, trainingId: result.training_id });
      return result;
    } catch (error) {
      this.logger.error('Failed to train crew:', error);
      throw error;
    }
  }

  async getTrainingStatus(trainingId: string): Promise<{
    status: 'running' | 'completed' | 'failed';
    progress?: number;
    metrics?: Record<string, any>;
    logs?: string[];
  }> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/training/${trainingId}/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to get training status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get training status:', error);
      throw error;
    }
  }

  // Analytics and Monitoring
  async getCrewAnalytics(crewId: string, timeRange = '24h'): Promise<{
    executionCount: number;
    averageExecutionTime: number;
    successRate: number;
    taskBreakdown: Record<string, any>;
    agentPerformance: Record<string, any>;
  }> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/crews/${crewId}/analytics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get crew analytics:', error);
      throw error;
    }
  }

  // Real-time Updates
  createWebSocketConnection(): WebSocket {
    const wsUrl = `${this.config.backendURL.replace('http', 'ws')}/ws/crewai`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      this.emit('websocket-connected');
      this.logger.info('WebSocket connected to CrewAI backend');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'execution_update':
            this.handleExecutionUpdate(data.payload);
            break;
          case 'task_completed':
            this.handleTaskCompleted(data.payload);
            break;
          case 'agent_thinking':
            this.handleAgentThinking(data.payload);
            break;
          case 'tool_used':
            this.handleToolUsed(data.payload);
            break;
          default:
            this.emit('websocket-message', data);
        }
      } catch (error) {
        this.logger.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      this.emit('websocket-disconnected');
      this.logger.info('WebSocket disconnected from CrewAI backend');
    };

    ws.onerror = (error) => {
      this.emit('websocket-error', error);
      this.logger.error('WebSocket error:', error);
    };

    return ws;
  }

  // Event Handlers
  private handleExecutionUpdate(payload: any): void {
    const execution = payload.execution;
    this.executions.set(execution.id, execution);
    this.emit('execution-updated', { execution });
  }

  private handleTaskCompleted(payload: any): void {
    const { executionId, taskIndex, result } = payload;
    this.emit('task-completed', { executionId, taskIndex, result });
  }

  private handleAgentThinking(payload: any): void {
    const { agentId, thought, reasoning } = payload;
    this.emit('agent-thinking', { agentId, thought, reasoning });
  }

  private handleToolUsed(payload: any): void {
    const { agentId, toolName, input, output } = payload;
    this.emit('tool-used', { agentId, toolName, input, output });
  }

  // Default Tools Initialization
  private initializeDefaultTools(): void {
    const defaultTools: CrewAITool[] = [
      {
        name: 'brolostack_data_reader',
        description: 'Read data from Brolostack stores',
        parameters: {
          store_name: { type: 'string', description: 'Name of the Brolostack store to read from' }
        },
        implementation: `
def brolostack_data_reader(store_name: str) -> dict:
    # Implementation would connect to Brolostack data
    return {"data": "placeholder"}
        `
      },
      {
        name: 'brolostack_data_writer',
        description: 'Write data to Brolostack stores',
        parameters: {
          store_name: { type: 'string', description: 'Name of the Brolostack store' },
          data: { type: 'object', description: 'Data to write to the store' }
        },
        implementation: `
def brolostack_data_writer(store_name: str, data: dict) -> dict:
    # Implementation would write to Brolostack data
    return {"status": "success"}
        `
      },
      {
        name: 'web_scraper',
        description: 'Scrape web content for research tasks',
        parameters: {
          url: { type: 'string', description: 'URL to scrape' },
          selector: { type: 'string', description: 'CSS selector for content' }
        },
        implementation: `
def web_scraper(url: str, selector: str = None) -> str:
    import requests
    from bs4 import BeautifulSoup
    
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    if selector:
        elements = soup.select(selector)
        return ' '.join([el.get_text() for el in elements])
    
    return soup.get_text()
        `
      }
    ];

    defaultTools.forEach(tool => this.tools.set(tool.name, tool));
  }

  // Utility Methods
  getCrews(): CrewAICrew[] {
    return Array.from(this.crews.values());
  }

  getExecutions(): CrewAIExecution[] {
    return Array.from(this.executions.values());
  }

  getTools(): CrewAITool[] {
    return Array.from(this.tools.values());
  }

  getConfig(): CrewAIConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<CrewAIConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  getStats() {
    return {
      connected: this.connected,
      crewCount: this.crews.size,
      executionCount: this.executions.size,
      toolCount: this.tools.size,
      memoryEnabled: this.config.memory?.enabled || false
    };
  }
}
