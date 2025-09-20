/**
 * 🤖 Brolostack AI Framework Showcase
 * Demonstrates the most advanced AI reasoning and governance system
 */

import React, { useState, useEffect } from 'react';
import {
  BrolostackProvider,
  BrolostackAIProvider,
  useBrolostackAI,
  useAIConversation,
  useAIStreaming,
  useAIGovernance,
  useReasoningFramework,
  Environment,
  BrolostackAI
} from 'brolostack';

// 🤖 AI Framework Dashboard
function AIFrameworkDashboard() {
  const { 
    ai, 
    isInitialized, 
    execute, 
    streamResponse, 
    getStatus, 
    getStatistics 
  } = useBrolostackAI();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [aiStatus, setAIStatus] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedFramework, setSelectedFramework] = useState<'react' | 'cot' | 'tot' | 'cotsc'>('cot');

  // AI conversation hook
  const { 
    messages, 
    sendMessage, 
    clearConversation, 
    isLoading, 
    messageCount 
  } = useAIConversation('main-chat');

  // AI streaming hook
  const { 
    streamingText, 
    isStreaming, 
    startStreaming, 
    clearStream 
  } = useAIStreaming();

  // AI governance monitoring
  const { 
    governanceStats, 
    isGovernanceActive, 
    safetyScore 
  } = useAIGovernance();

  // Reasoning framework hook
  const { execute: executeWithFramework } = useReasoningFramework(selectedFramework);

  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        setAIStatus(getStatus());
        setStatistics(getStatistics());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isInitialized, getStatus, getStatistics]);

  const handleExecuteQuery = async () => {
    if (!query.trim()) return;

    try {
      const executionResult = await execute(query, {
        conversationId: 'demo',
        userId: 'demo-user',
        context: {
          framework: selectedFramework,
          timestamp: Date.now()
        }
      });

      setResult(executionResult);
      
    } catch (error) {
      console.error('🤖 AI execution failed:', error);
    }
  };

  const handleStreamQuery = async () => {
    if (!query.trim()) return;

    try {
      await startStreaming(query, {
        conversationId: 'streaming-demo',
        framework: selectedFramework
      });
      
    } catch (error) {
      console.error('🤖 Streaming failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    try {
      await sendMessage(query, {
        framework: selectedFramework,
        governance: true
      });
      setQuery('');
      
    } catch (error) {
      console.error('🤖 Message failed:', error);
    }
  };

  const testQueries = [
    "What is the capital of France and why is it important?",
    "Solve this math problem: If I have 15 apples and give away 7, then buy 12 more, how many do I have?",
    "Plan a marketing strategy for a new AI product launch",
    "Analyze the pros and cons of renewable energy vs fossil fuels",
    "Write a Python function to calculate the Fibonacci sequence"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            🤖 BROLOSTACK AI FRAMEWORK SHOWCASE
          </h1>
          <p className="text-xl text-blue-300 mb-4">
            The Most Advanced AI Reasoning and Governance System
          </p>
          <div className="flex justify-center items-center space-x-4">
            <span className={`px-4 py-2 rounded-full font-bold ${isInitialized ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}>
              {isInitialized ? '🤖 AI ACTIVE' : '😴 AI SLEEPING'}
            </span>
            <span className="px-4 py-2 bg-blue-800 rounded-full">
              Framework: {selectedFramework.toUpperCase()}
            </span>
            <span className="px-4 py-2 bg-purple-800 rounded-full">
              ENV: {Environment.current().toUpperCase()}
            </span>
          </div>
        </header>

        {/* AI Status */}
        {aiStatus && (
          <div className="bg-black bg-opacity-50 rounded-lg p-6 mb-6 border border-blue-500">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">🤖 AI Framework Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{aiStatus.provider}</div>
                <div className="text-sm text-gray-300">AI Provider</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{aiStatus.model}</div>
                <div className="text-sm text-gray-300">Model</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{aiStatus.conversationCount}</div>
                <div className="text-sm text-gray-300">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {isGovernanceActive ? safetyScore : 'N/A'}
                </div>
                <div className="text-sm text-gray-300">Safety Score</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Interface */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-blue-400">🧠 AI Reasoning Interface</h2>
            
            <div className="space-y-4">
              {/* Framework Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Reasoning Framework:</label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value as any)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value="cot">Chain-of-Thought (CoT)</option>
                  <option value="react">ReAct (Reason + Act)</option>
                  <option value="tot">Tree-of-Thoughts (ToT)</option>
                  <option value="cotsc">CoT Self-Consistency</option>
                </select>
              </div>

              {/* Query Input */}
              <div>
                <label className="block text-sm font-medium mb-2">AI Query:</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything... AI will reason through it step by step"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                  rows={4}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExecuteQuery}
                  disabled={!query.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                >
                  🧠 Execute Reasoning
                </button>
                <button
                  onClick={handleStreamQuery}
                  disabled={!query.trim() || isStreaming}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 transition-colors"
                >
                  📡 Stream Response
                </button>
              </div>

              {/* Quick Test Queries */}
              <div>
                <label className="block text-sm font-medium mb-2">Quick Test Queries:</label>
                <div className="space-y-1">
                  {testQueries.map((testQuery, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(testQuery)}
                      className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      {testQuery}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-green-500">
            <h2 className="text-xl font-bold mb-4 text-green-400">📊 AI Response & Analysis</h2>
            
            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-green-900 rounded border border-green-500">
                  <h4 className="font-bold text-green-400 mb-2">✅ AI Response:</h4>
                  <div className="text-sm whitespace-pre-wrap">{result.response}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-900 rounded">
                    <div className="text-sm text-blue-300">Framework</div>
                    <div className="font-bold">{result.metadata.framework.toUpperCase()}</div>
                  </div>
                  <div className="p-3 bg-purple-900 rounded">
                    <div className="text-sm text-purple-300">Confidence</div>
                    <div className="font-bold">{(result.metadata.confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 bg-orange-900 rounded">
                    <div className="text-sm text-orange-300">Safety Score</div>
                    <div className="font-bold">{result.metadata.safetyScore}/100</div>
                  </div>
                  <div className="p-3 bg-red-900 rounded">
                    <div className="text-sm text-red-300">Execution Time</div>
                    <div className="font-bold">{result.metadata.executionTime}ms</div>
                  </div>
                </div>

                {result.reasoning && (
                  <div className="p-4 bg-gray-900 rounded border">
                    <h4 className="font-bold mb-2">🧠 Reasoning Process:</h4>
                    <div className="text-xs space-y-1">
                      {selectedFramework === 'cot' && result.reasoning.reasoning && 
                        result.reasoning.reasoning.map((step: any, i: number) => (
                          <div key={i} className="p-2 bg-gray-800 rounded">
                            <span className="text-yellow-400">Step {step.stepNumber}:</span> {step.reasoning}
                          </div>
                        ))
                      }
                      {selectedFramework === 'react' && result.reasoning.reasoning &&
                        result.reasoning.reasoning.map((step: any, i: number) => (
                          <div key={i} className="p-2 bg-gray-800 rounded">
                            <span className="text-yellow-400">Iteration {step.iteration}:</span>
                            <div><strong>Thought:</strong> {step.thought}</div>
                            <div><strong>Action:</strong> {step.action.type}</div>
                            <div><strong>Observation:</strong> {step.observation}</div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Streaming Display */}
            {isStreaming && (
              <div className="p-4 bg-purple-900 rounded border border-purple-500">
                <h4 className="font-bold text-purple-400 mb-2">📡 Streaming Response:</h4>
                <div className="text-sm whitespace-pre-wrap font-mono">
                  {streamingText}
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            )}
          </div>

          {/* Conversation Interface */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-400">💬 AI Conversation</h2>
            
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto space-y-2 p-3 bg-gray-900 rounded border">
                {messages.map((message: any) => (
                  <div key={message.id} className="space-y-1">
                    <div className="p-2 bg-blue-800 rounded">
                      <strong>You:</strong> {message.query}
                    </div>
                    <div className="p-2 bg-green-800 rounded">
                      <strong>AI ({message.framework}):</strong> {message.response}
                      <div className="text-xs text-gray-300 mt-1">
                        Confidence: {(message.confidence * 100).toFixed(1)}% | 
                        Safety: {message.safetyScore}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!query.trim() || isLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 transition-colors"
                >
                  💬 Send Message
                </button>
                <button
                  onClick={clearConversation}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  🗑️ Clear
                </button>
              </div>

              <div className="text-sm text-gray-300">
                Messages: {messageCount} | Loading: {isLoading ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Governance Monitor */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-yellow-500">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">🛡️ AI Governance Monitor</h2>
            
            {governanceStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-900 rounded">
                    <div className="text-2xl font-bold text-green-400">{governanceStats.version || '1.0.0'}</div>
                    <div className="text-sm text-gray-300">Governance Version</div>
                  </div>
                  <div className="text-center p-3 bg-blue-900 rounded">
                    <div className="text-2xl font-bold text-blue-400">{governanceStats.assessmentCount || 0}</div>
                    <div className="text-sm text-gray-300">Assessments</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold">Active Governance Modules:</h4>
                  {(governanceStats.enabledModules || []).map((module: string, i: number) => (
                    <div key={i} className="p-2 bg-gray-800 rounded flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                Governance monitoring will appear here when active
              </div>
            )}
          </div>
        </div>

        {/* Framework Comparison */}
        <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-6 border border-white">
          <h2 className="text-xl font-bold mb-4">🧠 AI Reasoning Framework Comparison</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-900 rounded">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-bold">ReAct</div>
              <div className="text-sm text-gray-300">Reason + Act</div>
              <div className="text-xs mt-2">Best for: Interactive tasks, tool usage, multi-step planning</div>
            </div>
            
            <div className="text-center p-4 bg-green-900 rounded">
              <div className="text-2xl mb-2">⛓️</div>
              <div className="font-bold">CoT</div>
              <div className="text-sm text-gray-300">Chain-of-Thought</div>
              <div className="text-xs mt-2">Best for: Step-by-step reasoning, logical problems</div>
            </div>
            
            <div className="text-center p-4 bg-purple-900 rounded">
              <div className="text-2xl mb-2">🌳</div>
              <div className="font-bold">ToT</div>
              <div className="text-sm text-gray-300">Tree-of-Thoughts</div>
              <div className="text-xs mt-2">Best for: Complex exploration, creative solutions</div>
            </div>
            
            <div className="text-center p-4 bg-orange-900 rounded">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-bold">CoT-SC</div>
              <div className="text-sm text-gray-300">Self-Consistency</div>
              <div className="text-xs mt-2">Best for: High accuracy, consensus building</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-6 border border-gray-500">
            <h2 className="text-xl font-bold mb-4 text-gray-400">📊 Execution Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics).map(([framework, stats]: [string, any]) => (
                <div key={framework} className="p-3 bg-gray-800 rounded">
                  <div className="font-bold text-white">{framework.toUpperCase()}</div>
                  <div className="text-sm space-y-1">
                    {stats.totalExecutions && (
                      <div>Executions: {stats.totalExecutions}</div>
                    )}
                    {stats.averageConfidence && (
                      <div>Avg Confidence: {(stats.averageConfidence * 100).toFixed(1)}%</div>
                    )}
                    {stats.successRate && (
                      <div>Success Rate: {(stats.successRate * 100).toFixed(1)}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-6 border border-white">
          <h2 className="text-xl font-bold mb-4">🚀 Active Features</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-900 rounded">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-sm">Advanced Reasoning</div>
              <div className="text-xs text-gray-300">4 Frameworks</div>
            </div>
            
            <div className="text-center p-3 bg-green-900 rounded">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-sm">AI Governance</div>
              <div className="text-xs text-gray-300">Sacred Data Protection</div>
            </div>
            
            <div className="text-center p-3 bg-purple-900 rounded">
              <div className="text-2xl mb-2">💾</div>
              <div className="text-sm">Memory & Context</div>
              <div className="text-xs text-gray-300">Semantic & Vector</div>
            </div>
            
            <div className="text-center p-3 bg-orange-900 rounded">
              <div className="text-2xl mb-2">🔗</div>
              <div className="text-sm">Backend Ready</div>
              <div className="text-xs text-gray-300">Node.js & Python</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleConfigure = () => {
    if (apiKey.trim()) {
      setIsConfigured(true);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="bg-black bg-opacity-50 rounded-lg p-8 border border-blue-500 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">🤖 Configure AI Framework</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AI Provider:</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="azure">Azure OpenAI</option>
                <option value="aws">AWS Bedrock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">API Key:</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your AI provider API key"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>

            <button
              onClick={handleConfigure}
              disabled={!apiKey.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
            >
              🚀 Initialize AI Framework
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrolostackProvider
      appName="ai-framework-showcase"
      config={{
        version: '1.0.0',
        enterprise: {
          ai: {
            enabled: true,
            governance: true,
            reasoning: true,
            tokenControl: true
          }
        }
      }}
    >
      <BrolostackAIProvider
        config={{
          provider: {
            name: provider,
            apiKey: apiKey,
            model: provider === 'openai' ? 'gpt-4' : 
                   provider === 'anthropic' ? 'claude-3-sonnet' :
                   provider === 'google' ? 'gemini-pro' : 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000
          },
          reasoning: {
            framework: 'cot', // Default to Chain-of-Thought
            cotConfig: {
              reasoning: {
                stepByStep: true,
                showWorkings: true,
                logicalProgression: true,
                intermediateSteps: true
              }
            }
          },
          governance: {
            enabled: true,
            realTimeMonitoring: true,
            safetyFirst: true,
            config: {
              safetyCompliance: {
                hallucinationDetection: { enabled: true, sensitivity: 'high', factCheckingLevel: 'advanced', realTimeValidation: true },
                jailbreakDetection: { enabled: true, patterns: [], behaviorAnalysis: true, contextualAwareness: true },
                toxicLanguageDetection: { enabled: true, categories: ['hate', 'harassment', 'violence'], threshold: 0.7, multilingual: true },
                privacyCompliance: { enabled: true, regulations: ['GDPR', 'CCPA'], piiDetection: true, dataMinimization: true },
                nationalCompliance: { enabled: true, countries: ['US', 'EU'], legalFrameworks: [], culturalSensitivity: true }
              }
            }
          },
          memory: {
            enabled: true,
            contextWindow: 20,
            semanticSearch: true,
            vectorSearch: true,
            persistentMemory: false
          },
          websocket: {
            enabled: false,
            realTimeUpdates: false,
            multiAgentSupport: false,
            streamingResponses: true
          },
          backend: {
            enabled: false,
            framework: 'none',
            endpoints: [],
            authentication: false
          },
          tools: {
            enabled: true,
            allowedTools: ['calculator', 'text_analyzer', 'web_search'],
            externalAPIs: {},
            customTools: {}
          },
          performance: {
            caching: true,
            parallelProcessing: true,
            responseStreaming: true,
            optimizedPrompts: true
          }
        }}
        autoConnect={true}
      >
        <AIFrameworkDashboard />
      </BrolostackAIProvider>
    </BrolostackProvider>
  );
}

export default App;
