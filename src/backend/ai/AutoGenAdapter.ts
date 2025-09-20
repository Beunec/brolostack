/**
 * AutoGen Multi-Agent Framework Adapter for Brolostack
 * Provides seamless integration with Microsoft AutoGen for multi-agent AI applications
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

export interface AutoGenConfig {
  backendURL: string;
  defaultLLMProvider?: 'openai' | 'anthropic' | 'google-cloud-ai' | 'azure-ai' | 'aws-bedrock' 
                      | 'huggingface' | 'cohere' | 'mistral' | 'replicate' | 'deepseek' 
                      | 'perplexity' | 'ibm-watson' | 'minimax' | 'databricks' | 'xai' 
                      | 'clarifai' | 'together-ai' | 'nlp-cloud' | 'aimlapi' | 'local';
  llmConfigs?: Record<string, {
    apiKey?: string;
    endpoint?: string;
    region?: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  }>;
  codeExecutionConfig?: {
    enabled: boolean;
    workingDirectory: string;
    timeout: number;
    allowedLanguages: string[];
    dockerEnabled?: boolean;
    securitySandbox?: boolean;
  };
  multiProviderFallback?: {
    enabled: boolean;
    fallbackOrder: string[];
    maxRetries: number;
  };
}

export interface AutoGenAgent {
  name: string;
  systemMessage: string;
  llmConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    functions?: AutoGenFunction[];
  };
  humanInputMode: 'NEVER' | 'TERMINATE' | 'ALWAYS';
  maxConsecutiveAutoReply: number;
  codeExecutionConfig?: {
    workingDirectory: string;
    useDocker: boolean;
    timeout: number;
  };
}

export interface AutoGenFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
  implementation?: string; // Python code for the function
}

export interface AutoGenConversation {
  id: string;
  agents: AutoGenAgent[];
  messages: AutoGenMessage[];
  status: 'active' | 'completed' | 'error' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface AutoGenMessage {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  messageType: 'text' | 'code' | 'function_call' | 'function_result' | 'system';
  timestamp: Date;
  metadata?: {
    executionResult?: {
      exitCode: number;
      output: string;
      error?: string;
    };
    functionCall?: {
      name: string;
      arguments: Record<string, any>;
      result?: any;
    };
  };
}

export interface AutoGenGroupChat {
  id: string;
  name: string;
  agents: AutoGenAgent[];
  adminName?: string;
  maxRound: number;
  speakerSelectionMethod: 'auto' | 'manual' | 'random' | 'round_robin';
  allowRepeatSpeaker: boolean;
  conversations: AutoGenConversation[];
}

export class AutoGenAdapter extends EventEmitter {
  private config: AutoGenConfig;
  private logger: Logger;
  private connected = false;
  private conversations: Map<string, AutoGenConversation> = new Map();
  private groupChats: Map<string, AutoGenGroupChat> = new Map();

  constructor(config: AutoGenConfig) {
    super();
    this.config = config;
    this.logger = new Logger(false, 'AutoGenAdapter');
  }

  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/health`);
      
      if (response.ok) {
        this.connected = true;
        this.emit('connected', { adapter: 'autogen' });
        this.logger.info('Connected to AutoGen backend');
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to connect to AutoGen backend:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: 'autogen' });
    this.logger.info('Disconnected from AutoGen backend');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Agent Management
  async createAgent(agentConfig: Omit<AutoGenAgent, 'name'> & { name: string }): Promise<AutoGenAgent> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/agents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.statusText}`);
      }

      const agent = await response.json();
      this.emit('agent-created', { agent });
      return agent;
    } catch (error) {
      this.logger.error('Failed to create agent:', error);
      throw error;
    }
  }

  async updateAgent(agentName: string, updates: Partial<AutoGenAgent>): Promise<AutoGenAgent> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/agents/${agentName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update agent: ${response.statusText}`);
      }

      const agent = await response.json();
      this.emit('agent-updated', { agent });
      return agent;
    } catch (error) {
      this.logger.error('Failed to update agent:', error);
      throw error;
    }
  }

  async deleteAgent(agentName: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/agents/${agentName}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete agent: ${response.statusText}`);
      }

      this.emit('agent-deleted', { agentName });
    } catch (error) {
      this.logger.error('Failed to delete agent:', error);
      throw error;
    }
  }

  async listAgents(): Promise<AutoGenAgent[]> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/agents`);
      
      if (!response.ok) {
        throw new Error(`Failed to list agents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to list agents:', error);
      throw error;
    }
  }

  // Conversation Management
  async createConversation(
    initiatorAgent: string,
    recipientAgent: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<AutoGenConversation> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/conversations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiator: initiatorAgent,
          recipient: recipientAgent,
          message,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      const conversation = await response.json();
      this.conversations.set(conversation.id, conversation);
      this.emit('conversation-created', { conversation });
      return conversation;
    } catch (error) {
      this.logger.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async sendMessage(
    conversationId: string,
    sender: string,
    recipient: string,
    content: string,
    messageType: AutoGenMessage['messageType'] = 'text'
  ): Promise<AutoGenMessage> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/conversations/${conversationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender,
          recipient,
          content,
          messageType,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const message = await response.json();
      this.emit('message-sent', { conversationId, message });
      return message;
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<AutoGenConversation | null> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/conversations/${conversationId}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get conversation: ${response.statusText}`);
      }

      const conversation = await response.json();
      this.conversations.set(conversationId, conversation);
      return conversation;
    } catch (error) {
      this.logger.error('Failed to get conversation:', error);
      throw error;
    }
  }

  async terminateConversation(conversationId: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/conversations/${conversationId}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to terminate conversation: ${response.statusText}`);
      }

      const conversation = this.conversations.get(conversationId);
      if (conversation) {
        conversation.status = 'terminated';
      }

      this.emit('conversation-terminated', { conversationId, reason });
    } catch (error) {
      this.logger.error('Failed to terminate conversation:', error);
      throw error;
    }
  }

  // Group Chat Management
  async createGroupChat(config: {
    name: string;
    agents: string[];
    adminName?: string;
    maxRound?: number;
    speakerSelectionMethod?: AutoGenGroupChat['speakerSelectionMethod'];
    allowRepeatSpeaker?: boolean;
  }): Promise<AutoGenGroupChat> {
    try {
      const groupChatConfig = {
        maxRound: 10,
        speakerSelectionMethod: 'auto' as const,
        allowRepeatSpeaker: true,
        ...config
      };

      const response = await fetch(`${this.config.backendURL}/api/groupchat/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupChatConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to create group chat: ${response.statusText}`);
      }

      const groupChat = await response.json();
      this.groupChats.set(groupChat.id, groupChat);
      this.emit('groupchat-created', { groupChat });
      return groupChat;
    } catch (error) {
      this.logger.error('Failed to create group chat:', error);
      throw error;
    }
  }

  async startGroupChat(
    groupChatId: string,
    initialMessage: string,
    sender?: string
  ): Promise<AutoGenConversation> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/groupchat/${groupChatId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: initialMessage,
          sender
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start group chat: ${response.statusText}`);
      }

      const conversation = await response.json();
      this.emit('groupchat-started', { groupChatId, conversation });
      return conversation;
    } catch (error) {
      this.logger.error('Failed to start group chat:', error);
      throw error;
    }
  }

  // Code Execution
  async executeCode(
    code: string,
    language: 'python' | 'javascript' | 'bash' | 'sql',
    workingDirectory?: string
  ): Promise<{
    exitCode: number;
    output: string;
    error?: string;
    executionTime: number;
  }> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          workingDirectory: workingDirectory || this.config.codeExecutionConfig?.workingDirectory,
          timeout: this.config.codeExecutionConfig?.timeout || 30
        })
      });

      if (!response.ok) {
        throw new Error(`Code execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('code-executed', { code, language, result });
      return result;
    } catch (error) {
      this.logger.error('Failed to execute code:', error);
      throw error;
    }
  }

  // Function Registration
  async registerFunction(func: AutoGenFunction): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/functions/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(func)
      });

      if (!response.ok) {
        throw new Error(`Failed to register function: ${response.statusText}`);
      }

      this.emit('function-registered', { function: func });
    } catch (error) {
      this.logger.error('Failed to register function:', error);
      throw error;
    }
  }

  async callFunction(
    functionName: string,
    arguments_: Record<string, any>,
    context?: Record<string, any>
  ): Promise<any> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/functions/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function_name: functionName,
          arguments: arguments_,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`Function call failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('function-called', { functionName, arguments: arguments_, result });
      return result.return_value;
    } catch (error) {
      this.logger.error('Failed to call function:', error);
      throw error;
    }
  }

  // Workflow Management
  async createWorkflow(workflow: {
    name: string;
    description: string;
    agents: string[];
    steps: Array<{
      name: string;
      agent: string;
      action: string;
      parameters?: Record<string, any>;
      conditions?: Record<string, any>;
    }>;
    triggers?: Array<{
      type: 'schedule' | 'webhook' | 'event';
      config: Record<string, any>;
    }>;
  }): Promise<string> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/workflows/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.statusText}`);
      }

      const result = await response.json();
      const workflowId = result.workflow_id;
      this.emit('workflow-created', { workflowId, workflow });
      return workflowId;
    } catch (error) {
      this.logger.error('Failed to create workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(
    workflowId: string,
    inputs?: Record<string, any>
  ): Promise<{
    executionId: string;
    status: 'running' | 'completed' | 'failed';
    results?: Record<string, any>;
  }> {
    try {
      const response = await fetch(`${this.config.backendURL}/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs })
      });

      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit('workflow-executed', { workflowId, executionId: result.execution_id });
      return result;
    } catch (error) {
      this.logger.error('Failed to execute workflow:', error);
      throw error;
    }
  }

  // Real-time Updates
  createWebSocketConnection(): WebSocket {
    const wsUrl = `${this.config.backendURL.replace('http', 'ws')}/ws/autogen`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      this.emit('websocket-connected');
      this.logger.info('WebSocket connected to AutoGen backend');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'conversation_update':
            this.handleConversationUpdate(data.payload);
            break;
          case 'message_received':
            this.handleMessageReceived(data.payload);
            break;
          case 'agent_status':
            this.handleAgentStatus(data.payload);
            break;
          case 'code_execution_result':
            this.handleCodeExecutionResult(data.payload);
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
      this.logger.info('WebSocket disconnected from AutoGen backend');
    };

    ws.onerror = (error) => {
      this.emit('websocket-error', error);
      this.logger.error('WebSocket error:', error);
    };

    return ws;
  }

  // Event Handlers
  private handleConversationUpdate(payload: any): void {
    const conversation = payload.conversation;
    this.conversations.set(conversation.id, conversation);
    this.emit('conversation-updated', { conversation });
  }

  private handleMessageReceived(payload: any): void {
    const { conversationId, message } = payload;
    this.emit('message-received', { conversationId, message });
  }

  private handleAgentStatus(payload: any): void {
    const { agentName, status } = payload;
    this.emit('agent-status-changed', { agentName, status });
  }

  private handleCodeExecutionResult(payload: any): void {
    const { executionId, result } = payload;
    this.emit('code-execution-completed', { executionId, result });
  }

  // Utility Methods
  getConversations(): AutoGenConversation[] {
    return Array.from(this.conversations.values());
  }

  getGroupChats(): AutoGenGroupChat[] {
    return Array.from(this.groupChats.values());
  }

  getConfig(): AutoGenConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AutoGenConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  getStats() {
    return {
      connected: this.connected,
      conversationCount: this.conversations.size,
      groupChatCount: this.groupChats.size,
      backendURL: this.config.backendURL
    };
  }
}
