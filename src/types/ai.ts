/**
 * Brolostack - AI Type Definitions
 */

export interface AIConfig {
  provider: 
    | 'openai' 
    | 'anthropic' 
    | 'google' 
    | 'azure' 
    | 'aws' 
    | 'huggingface' 
    | 'cohere' 
    | 'ai21' 
    | 'deepseek' 
    | 'perplexity' 
    | 'ibm-watson' 
    | 'minimax' 
    | 'databricks' 
    | 'xai' 
    | 'clarifai' 
    | 'together-ai' 
    | 'nlp-cloud' 
    | 'aimapi' 
    | 'mistral' 
    | 'groq' 
    | 'replicate' 
    | 'custom';
  model: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  retries?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: AIToolCall[];
  tool_call_id?: string;
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

export interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: AIChoice[];
  usage: AIUsage;
  system_fingerprint?: string;
}

export interface AIChoice {
  index: number;
  message: AIMessage;
  finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'null';
  logprobs?: any;
}

export interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AIAgentConfig {
  id: string;
  name: string;
  description?: string;
  type: 'llm' | 'multi-agent' | 'custom';
  config: AIConfig;
  systemPrompt?: string;
  tools?: AITool[];
  memory?: {
    enabled: boolean;
    maxSize: number;
    strategy: 'fifo' | 'lru' | 'importance';
  };
  guardrails?: AIGuardrails;
  capabilities: AICapabilities;
}

export interface AIGuardrails {
  maxTokens: number;
  maxRequests: number;
  allowedDomains: string[];
  forbiddenPatterns: string[];
  contentFilter: boolean;
  rateLimit: {
    requests: number;
    window: number; // in milliseconds
  };
}

export interface AICapabilities {
  textGeneration: boolean;
  codeGeneration: boolean;
  dataAnalysis: boolean;
  fileOperations: boolean;
  webSearch: boolean;
  imageGeneration: boolean;
  audioProcessing: boolean;
  customFunctions: boolean;
}

export interface AIMemoryEntry {
  id: string;
  timestamp: number;
  type: 'conversation' | 'context' | 'knowledge' | 'preference';
  content: any;
  importance: number; // 0-1
  tags: string[];
  metadata?: Record<string, any>;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'llm' | 'multi-agent' | 'custom';
  config: AIAgentConfig;
  memory: AIMemory;
  state: AIAgentState;
  execute(prompt: string, context?: any): Promise<AIResponse>;
  addTool(tool: AITool): void;
  removeTool(toolName: string): void;
  clearMemory(): void;
  getMemoryStats(): AIMemoryStats;
}

export interface AIAgentState {
  isActive: boolean;
  isProcessing: boolean;
  lastActivity: number;
  totalRequests: number;
  totalTokens: number;
  errors: AIError[];
}

export interface AIError {
  id: string;
  timestamp: number;
  type: 'api' | 'validation' | 'rate-limit' | 'timeout' | 'unknown';
  message: string;
  context?: any;
  retryable: boolean;
}

export interface AIMemory {
  entries: Map<string, AIMemoryEntry>;
  maxSize: number;
  strategy: 'fifo' | 'lru' | 'importance';
  
  store(key: string, value: any, type?: string, importance?: number): Promise<void>;
  retrieve(key: string): Promise<AIMemoryEntry | undefined>;
  search(query: string, type?: string, limit?: number): Promise<AIMemoryEntry[]>;
  clear(): Promise<void>;
  getStats(): AIMemoryStats;
  cleanup(): Promise<void>;
}

export interface AIMemoryStats {
  totalEntries: number;
  totalSize: number;
  averageImportance: number;
  oldestEntry?: AIMemoryEntry | undefined;
  newestEntry?: AIMemoryEntry | undefined;
  entriesByType: Record<string, number>;
}

export interface AIMultiAgentSystem {
  id: string;
  name: string;
  agents: Map<string, AIAgent>;
  coordinator: AICoordinator;
  workflow: AIWorkflow;
  state: AIMultiAgentState;
  
  addAgent(agent: AIAgent): void;
  removeAgent(agentId: string): void;
  executeTask(task: AITask): Promise<AIResult>;
  getSystemStats(): AIMultiAgentStats;
}

export interface AICoordinator {
  id: string;
  name: string;
  strategy: 'sequential' | 'parallel' | 'hierarchical' | 'democratic';
  rules: AICoordinationRule[];
  execute(agents: AIAgent[], task: AITask): Promise<AIResult>;
}

export interface AICoordinationRule {
  id: string;
  condition: (context: any) => boolean;
  action: (context: any) => any;
  priority: number;
}

export interface AIWorkflow {
  id: string;
  name: string;
  steps: AIWorkflowStep[];
  conditions: AIWorkflowCondition[];
  execute(context: any): Promise<AIResult>;
}

export interface AIWorkflowStep {
  id: string;
  name: string;
  agentId: string;
  input: any;
  output?: any;
  condition?: (context: any) => boolean;
  timeout?: number;
  retries?: number;
}

export interface AIWorkflowCondition {
  id: string;
  condition: (context: any) => boolean;
  action: 'continue' | 'skip' | 'stop' | 'retry';
  targetStep?: string;
}

export interface AITask {
  id: string;
  type: string;
  description: string;
  input: any;
  priority: number;
  deadline?: number;
  requirements: AITaskRequirement[];
  context?: any;
}

export interface AITaskRequirement {
  type: 'capability' | 'resource' | 'constraint';
  value: any;
  operator: 'equals' | 'contains' | 'greater-than' | 'less-than';
}

export interface AIResult {
  id: string;
  taskId: string;
  success: boolean;
  output?: any;
  error?: AIError;
  metadata: {
    executionTime: number;
    tokensUsed: number;
    agentsUsed: string[];
    stepsCompleted: string[];
  };
}

export interface AIMultiAgentState {
  isActive: boolean;
  currentTask?: AITask;
  activeAgents: string[];
  completedTasks: string[];
  failedTasks: string[];
  totalExecutionTime: number;
  lastActivity: number;
}

export interface AIMultiAgentStats {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  totalTokensUsed: number;
  systemUptime: number;
}
