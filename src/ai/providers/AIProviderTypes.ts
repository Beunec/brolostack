/**
 * Shared AI Provider Types and Interfaces
 * Extracted to break circular dependency between AIProviderFactory and AllAIProviders
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { Logger } from '../../utils/Logger';

// AI Provider Types
export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google-cloud-ai' 
  | 'azure-ai' 
  | 'aws-bedrock'
  | 'huggingface' 
  | 'stability-ai' 
  | 'cohere' 
  | 'mistral' 
  | 'replicate'
  | 'deepseek' 
  | 'perplexity' 
  | 'ibm-watson' 
  | 'minimax' 
  | 'databricks'
  | 'xai' 
  | 'clarifai' 
  | 'together-ai' 
  | 'nlp-cloud' 
  | 'aimlapi';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  endpoint?: string;
  region?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  timeout?: number;
  retryAttempts?: number;
  customHeaders?: Record<string, string>;
  rateLimiting?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface AIProviderResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AIProviderCapabilities {
  textGeneration: boolean;
  chatCompletion: boolean;
  imageGeneration: boolean;
  imageAnalysis: boolean;
  audioGeneration: boolean;
  audioTranscription: boolean;
  embedding: boolean;
  fineTuning: boolean;
  streaming: boolean;
  functionCalling: boolean;
  multimodal: boolean;
  maxContextLength: number;
  supportedLanguages: string[];
}

export abstract class BaseAIAdapter extends EventEmitter {
  protected config: AIProviderConfig;
  protected logger: Logger;

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
    this.logger = new Logger(false, `${config.provider}Adapter`);
  }

  abstract generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse>;
  abstract streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void>;
  abstract generateEmbedding(text: string, config: AIProviderConfig): Promise<any>;
  abstract chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse>;
  abstract getCapabilities(): AIProviderCapabilities;
  abstract healthCheck(): Promise<void>;
  
  // Optional methods that some providers implement
  analyzeImage?(image: string | Blob, prompt?: string): Promise<any>;
}

