/**
 * AI Provider Factory for Brolostack
 * Unified interface for all AI model providers
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';
import { 
  BaseAIAdapter,
  AIProvider,
  AIProviderConfig,
  AIProviderResponse,
  AIProviderCapabilities
} from './AIProviderTypes';
import { 
  DeepSeekAdapter, 
  PerplexityAdapter, 
  IBMWatsonAdapter, 
  MiniMaxAdapter, 
  DatabricksAdapter, 
  XAIAdapter, 
  ClarifaiAdapter, 
  TogetherAIAdapter, 
  NLPCloudAdapter, 
  AIMAPIAdapter 
} from './AllAIProviders';

// AIProvider type now imported from AIProviderTypes.ts

// AIProviderConfig now imported from AIProviderTypes.ts

// AIProviderResponse now imported from AIProviderTypes.ts

// AIProviderCapabilities now imported from AIProviderTypes.ts

export class AIProviderFactory extends EventEmitter {
  private logger: Logger;
  private providers: Map<AIProvider, any> = new Map();
  private configs: Map<AIProvider, AIProviderConfig> = new Map();

  constructor() {
    super();
    this.logger = new Logger(false, 'AIProviderFactory');
  }

  // Provider Registration
  registerProvider(config: AIProviderConfig): void {
    const adapter = this.createProviderAdapter(config);
    this.providers.set(config.provider, adapter);
    this.configs.set(config.provider, config);
    
    this.emit('provider-registered', { provider: config.provider, config });
    this.logger.info(`Registered AI provider: ${config.provider}`);
  }

  unregisterProvider(provider: AIProvider): void {
    this.providers.delete(provider);
    this.configs.delete(provider);
    
    this.emit('provider-unregistered', { provider });
    this.logger.info(`Unregistered AI provider: ${provider}`);
  }

  // Text Generation
  async generateText(
    provider: AIProvider,
    prompt: string,
    options?: Partial<AIProviderConfig>
  ): Promise<AIProviderResponse> {
    const adapter = this.getProvider(provider);
    const config = this.mergeConfig(provider, options);

    try {
      const response = await adapter.generateText(prompt, config);
      this.emit('text-generated', { provider, prompt, response });
      return response;
    } catch (error) {
      this.emit('text-generation-failed', { provider, prompt, error });
      throw error;
    }
  }

  // Chat Completion
  async chatCompletion(
    provider: AIProvider,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: Partial<AIProviderConfig>
  ): Promise<AIProviderResponse> {
    const adapter = this.getProvider(provider);
    const config = this.mergeConfig(provider, options);

    try {
      const response = await adapter.chatCompletion(messages, config);
      this.emit('chat-completed', { provider, messages, response });
      return response;
    } catch (error) {
      this.emit('chat-completion-failed', { provider, messages, error });
      throw error;
    }
  }

  // Streaming
  async streamCompletion(
    provider: AIProvider,
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: Partial<AIProviderConfig>
  ): Promise<void> {
    const adapter = this.getProvider(provider);
    const config = this.mergeConfig(provider, { ...options, streaming: true });

    try {
      await adapter.streamCompletion(prompt, onChunk, config);
      this.emit('stream-completed', { provider, prompt });
    } catch (error) {
      this.emit('stream-failed', { provider, prompt, error });
      throw error;
    }
  }

  // Embeddings
  async generateEmbedding(
    provider: AIProvider,
    text: string,
    options?: Partial<AIProviderConfig>
  ): Promise<{
    embedding: number[];
    model: string;
    usage?: { tokens: number };
  }> {
    const adapter = this.getProvider(provider);
    const config = this.mergeConfig(provider, options);

    try {
      const response = await adapter.generateEmbedding(text, config);
      this.emit('embedding-generated', { provider, text, response });
      return response;
    } catch (error) {
      this.emit('embedding-failed', { provider, text, error });
      throw error;
    }
  }

  // Image Generation
  async generateImage(
    provider: AIProvider,
    prompt: string,
    options?: {
      size?: string;
      quality?: string;
      style?: string;
      count?: number;
    }
  ): Promise<{
    images: Array<{
      url?: string;
      b64_json?: string;
      revised_prompt?: string;
    }>;
    created: number;
  }> {
    const adapter = this.getProvider(provider);
    
    if (!adapter.generateImage) {
      throw new Error(`Provider ${provider} does not support image generation`);
    }

    try {
      const response = await adapter.generateImage(prompt, options);
      this.emit('image-generated', { provider, prompt, response });
      return response;
    } catch (error) {
      this.emit('image-generation-failed', { provider, prompt, error });
      throw error;
    }
  }

  // Provider-specific Methods
  private createProviderAdapter(config: AIProviderConfig): any {
    switch (config.provider) {
      case 'openai':
        return new OpenAIAdapter(config);
      case 'anthropic':
        return new AnthropicAdapter(config);
      case 'google-cloud-ai':
        return new GoogleCloudAIAdapter(config);
      case 'azure-ai':
      case 'aws-bedrock':
      case 'huggingface':
      case 'stability-ai':
      case 'cohere':
      case 'mistral':
      case 'replicate':
        // These adapters would be implemented - using OpenAI as fallback for now
        return new OpenAIAdapter(config);
      case 'deepseek':
        return new DeepSeekAdapter(config);
      case 'perplexity':
        return new PerplexityAdapter(config);
      case 'ibm-watson':
        return new IBMWatsonAdapter(config);
      case 'minimax':
        return new MiniMaxAdapter(config);
      case 'databricks':
        return new DatabricksAdapter(config);
      case 'xai':
        return new XAIAdapter(config);
      case 'clarifai':
        return new ClarifaiAdapter(config);
      case 'together-ai':
        return new TogetherAIAdapter(config);
      case 'nlp-cloud':
        return new NLPCloudAdapter(config);
      case 'aimlapi':
        return new AIMAPIAdapter(config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private getProvider(provider: AIProvider): any {
    const adapter = this.providers.get(provider);
    if (!adapter) {
      throw new Error(`Provider ${provider} is not registered`);
    }
    return adapter;
  }

  private mergeConfig(provider: AIProvider, options?: Partial<AIProviderConfig>): AIProviderConfig {
    const baseConfig = this.configs.get(provider);
    if (!baseConfig) {
      throw new Error(`Provider ${provider} is not registered`);
    }
    
    return { ...baseConfig, ...options };
  }

  // Utility Methods
  getRegisteredProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  getProviderCapabilities(provider: AIProvider): AIProviderCapabilities {
    const adapter = this.getProvider(provider);
    return adapter.getCapabilities();
  }

  getProviderConfig(provider: AIProvider): AIProviderConfig {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Provider ${provider} is not registered`);
    }
    return { ...config };
  }

  async testProvider(provider: AIProvider): Promise<boolean> {
    try {
      const adapter = this.getProvider(provider);
      await adapter.healthCheck();
      return true;
    } catch (error) {
      this.logger.error(`Provider ${provider} health check failed:`, error);
      return false;
    }
  }

  getStats() {
    return {
      registeredProviders: this.providers.size,
      providers: Array.from(this.providers.keys())
    };
  }
}

// Minimal adapter implementations for core providers

class OpenAIAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].text,
      usage: data.usage,
      model: config.model,
      provider: 'openai',
      timestamp: new Date()
    };
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not implemented for basic OpenAI adapter');
  }

  override async generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any> {
    throw new Error('Embeddings not implemented for basic OpenAI adapter');
  }

  override async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'openai',
      timestamp: new Date()
    };
  }

  override getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: false,
      fineTuning: false,
      streaming: false,
      functionCalling: true,
      multimodal: false,
      maxContextLength: 4096,
      supportedLanguages: ['en']
    };
  }

  override async healthCheck(): Promise<void> {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`OpenAI health check failed: ${response.statusText}`);
    }
  }
}

class AnthropicAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    // Basic implementation
    return {
      content: `Anthropic response to: ${prompt}`,
      model: config.model,
      provider: 'anthropic',
      timestamp: new Date()
    };
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not implemented for basic Anthropic adapter');
  }

  override async generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any> {
    throw new Error('Embeddings not implemented for basic Anthropic adapter');
  }

  override async chatCompletion(_messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    return {
      content: 'Anthropic chat response',
      model: config.model,
      provider: 'anthropic',
      timestamp: new Date()
    };
  }

  override getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: false,
      fineTuning: false,
      streaming: false,
      functionCalling: false,
      multimodal: false,
      maxContextLength: 100000,
      supportedLanguages: ['en']
    };
  }

  override async healthCheck(): Promise<void> {
    // Basic health check
  }
}

class GoogleCloudAIAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    return {
      content: `Google Cloud AI response to: ${prompt}`,
      model: config.model,
      provider: 'google-cloud-ai',
      timestamp: new Date()
    };
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not implemented for basic Google Cloud AI adapter');
  }

  override async generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any> {
    throw new Error('Embeddings not implemented for basic Google Cloud AI adapter');
  }

  override async chatCompletion(_messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    return {
      content: 'Google Cloud AI chat response',
      model: config.model,
      provider: 'google-cloud-ai',
      timestamp: new Date()
    };
  }

  override getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: false,
      fineTuning: false,
      streaming: false,
      functionCalling: false,
      multimodal: false,
      maxContextLength: 8192,
      supportedLanguages: ['en']
    };
  }

  override async healthCheck(): Promise<void> {
    // Basic health check
  }
}
