/**
 * 🤖 Brolostack AI React Provider
 * Complete React integration for the Brolostack AI Framework
 * Supports ReAct, CoT, ToT, CoT-SC with governance and real-time features
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  BrolostackAIFramework, 
  getBrolostackAI, 
  BrolostackAI,
  BrolostackAIConfig,
  AIExecutionResult 
} from '../ai/BrolostackAIFramework';
import { Environment } from '../core/EnvironmentManager';

interface BrolostackAIContextType {
  ai: BrolostackAIFramework;
  isInitialized: boolean;
  execute: (query: string, options?: any) => Promise<AIExecutionResult>;
  streamResponse: (query: string, onChunk: (chunk: string) => void, options?: any) => Promise<AIExecutionResult>;
  clearMemory: (conversationId?: string) => void;
  getStatus: () => any;
  getStatistics: () => any;
}

const BrolostackAIContext = createContext<BrolostackAIContextType | null>(null);

export interface BrolostackAIProviderProps {
  children: ReactNode;
  config: BrolostackAIConfig;
  autoConnect?: boolean;
}

export function BrolostackAIProvider({
  children,
  config,
  autoConnect = true
}: BrolostackAIProviderProps) {
  const [ai] = useState(() => getBrolostackAI(config));
  const [isInitialized, setIsInitialized] = useState(false);
  const [executionCount, setExecutionCount] = useState(0);

  useEffect(() => {
    if (autoConnect) {
      setIsInitialized(true);
      console.log('🤖 Brolostack AI Framework initialized');
    }

    // Listen for AI events
    ai.on('ai-execution-completed', (data: any) => {
      setExecutionCount(prev => prev + 1);
      
      if (Environment.isDev()) {
        console.log('🤖 AI execution completed:', {
          framework: data.result.metadata.framework,
          confidence: data.result.metadata.confidence,
          executionTime: data.result.metadata.executionTime
        });
      }
    });

    return () => {
      ai.removeAllListeners();
    };
  }, [ai, autoConnect]);

  const execute = useCallback(async (query: string, options: any = {}) => {
    return await ai.execute(query, options);
  }, [ai]);

  const streamResponse = useCallback(async (
    query: string, 
    onChunk: (chunk: string) => void, 
    options: any = {}
  ) => {
    return await ai.streamResponse(query, onChunk, options);
  }, [ai]);

  const clearMemory = useCallback((conversationId?: string) => {
    ai.clearMemory(conversationId);
  }, [ai]);

  const getStatus = useCallback(() => {
    return ai.getStatus();
  }, [ai]);

  const getStatistics = useCallback(() => {
    return ai.getExecutionStatistics();
  }, [ai]);

  const contextValue: BrolostackAIContextType = {
    ai,
    isInitialized,
    execute,
    streamResponse,
    clearMemory,
    getStatus,
    getStatistics
  };

  return (
    <BrolostackAIContext.Provider value={contextValue}>
      {children}
      {Environment.isDev() && (
        <div style={{
          position: 'fixed',
          bottom: 60,
          right: 10,
          background: 'rgba(0, 100, 255, 0.1)',
          border: '2px solid blue',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999
        }}>
          🤖 AI ACTIVE<br/>
          Framework: {config.reasoning.framework.toUpperCase()}<br/>
          Executions: {executionCount}<br/>
          Provider: {config.provider.name}
        </div>
      )}
    </BrolostackAIContext.Provider>
  );
}

/**
 * 🤖 Hook for using Brolostack AI
 */
export function useBrolostackAI() {
  const context = useContext(BrolostackAIContext);
  
  if (!context) {
    throw new Error('useBrolostackAI must be used within a BrolostackAIProvider');
  }
  
  return context;
}

/**
 * 🤖 Hook for AI conversations
 */
export function useAIConversation(conversationId: string) {
  const { execute, clearMemory } = useBrolostackAI();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (query: string, options: any = {}) => {
    setIsLoading(true);
    
    try {
      const result = await execute(query, { 
        conversationId, 
        ...options 
      });
      
      const newMessage = {
        id: Date.now().toString(),
        query,
        response: result.response,
        timestamp: Date.now(),
        framework: result.metadata.framework,
        confidence: result.metadata.confidence,
        safetyScore: result.metadata.safetyScore
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      return result;
      
    } catch (error) {
      console.error('🤖 AI execution failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    clearMemory(conversationId);
  };

  return {
    messages,
    sendMessage,
    clearConversation,
    isLoading,
    messageCount: messages.length
  };
}

/**
 * 🤖 Hook for streaming AI responses
 */
export function useAIStreaming() {
  const { streamResponse } = useBrolostackAI();
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = async (query: string, options: any = {}) => {
    setIsStreaming(true);
    setStreamingText('');
    
    try {
      const result = await streamResponse(
        query,
        (chunk: string) => {
          setStreamingText(prev => prev + chunk);
        },
        options
      );
      
      return result;
      
    } catch (error) {
      console.error('🤖 Streaming failed:', error);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  };

  const clearStream = () => {
    setStreamingText('');
  };

  return {
    streamingText,
    isStreaming,
    startStreaming,
    clearStream
  };
}

/**
 * 🤖 Hook for AI governance monitoring
 */
export function useAIGovernance() {
  const { getStatistics } = useBrolostackAI();
  const [governanceStats, setGovernanceStats] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getStatistics();
      setGovernanceStats(stats.governance);
    }, 2000);

    return () => clearInterval(interval);
  }, [getStatistics]);

  return {
    governanceStats,
    isGovernanceActive: !!governanceStats,
    safetyScore: governanceStats?.overall?.score || 0
  };
}

/**
 * 🤖 Hook for reasoning framework selection
 */
export function useReasoningFramework(framework: 'react' | 'cot' | 'tot' | 'cotsc') {
  const { execute } = useBrolostackAI();

  const executeWithFramework = async (query: string, options: any = {}) => {
    // This would ideally switch the framework, but for now we use the utility functions
    switch (framework) {
      case 'react':
        return await BrolostackAI.react(query, options.provider, options.apiKey, options.model);
      case 'cot':
        return await BrolostackAI.cot(query, options.provider, options.apiKey, options.model);
      case 'tot':
        return await BrolostackAI.tot(query, options.provider, options.apiKey, options.model);
      case 'cotsc':
        return await BrolostackAI.cotsc(query, options.provider, options.apiKey, options.model);
      default:
        return await execute(query, options);
    }
  };

  return {
    framework,
    execute: executeWithFramework
  };
}

// Note: BrolostackAIProviderProps type is defined above
