/**
 * 💰 Brolostack Token Usage Control System Showcase
 * Demonstrates the most advanced cost management system for AI applications
 */

import React, { useState, useEffect } from 'react';
import {
  BrolostackProvider,
  BrolostackAIProvider,
  useBrolostackAI,
  useTokenUsage,
  TokenUsageDisplay,
  TokenUsageGuard,
  getBrolostackBSDGF4AI,
  Environment
} from 'brolostack';

// 💰 Token Usage Dashboard
function TokenUsageDashboard() {
  const [userId] = useState('demo-user-123');
  const [sessionId] = useState('session-' + Date.now());
  const [controlLevel, setControlLevel] = useState<'basic' | 'strict' | 'aggressive'>('basic');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Token usage hook with all monitoring features
  const {
    metrics,
    isLoading,
    warnings,
    lastValidation,
    totalCost,
    remainingTokens,
    usagePercentage,
    validateTokenUsage,
    trackStreamingTokens,
    resetUserMetrics,
    clearWarnings,
    getCostEstimate,
    shouldBlockRequest,
    isNearLimit,
    isAtLimit,
    canMakeRequest
  } = useTokenUsage({
    userId,
    sessionId,
    controlLevel,
    maxInputTokens: 4000,
    maxOutputTokens: 2000,
    enableRealTimeMonitoring: true,
    onLimitExceeded: (result) => {
      console.warn('💰 Token limit exceeded:', result);
      alert(`Token limit exceeded: ${result.reason}`);
    },
    onStreamingCutoff: (data) => {
      console.warn('💰 Streaming cutoff:', data);
      alert(`Streaming cutoff: ${data.reason}`);
    },
    onWarningThreshold: (warning) => {
      console.warn('💰 Warning threshold reached:', warning);
    }
  });

  const { execute } = useBrolostackAI();

  // Sample queries for testing
  const testQueries = [
    "Write a short story about AI (should use ~500 tokens)",
    "Explain quantum computing in detail (should use ~1500 tokens)", 
    "Create a comprehensive business plan (should use ~3000 tokens)",
    "Generate a very long technical document (should exceed limits)",
    "Simple math: 2+2 (should use very few tokens)"
  ];

  const handleExecuteQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    
    try {
      // Pre-validate token usage
      const validation = await validateTokenUsage(
        query,
        'openai',
        'gpt-4',
        2000 // Requested max output tokens
      );

      console.log('💰 Token validation result:', validation);

      if (!validation.allowed && controlLevel === 'strict') {
        alert(`Request blocked: ${validation.reason}`);
        setIsProcessing(false);
        return;
      }

      if (!validation.allowed && controlLevel === 'aggressive') {
        alert(`Aggressive control: ${validation.reason}`);
        setIsProcessing(false);
        return;
      }

      // Execute AI request with token tracking
      const aiResult = await execute(query, {
        userId,
        sessionId,
        provider: 'openai',
        model: 'gpt-4',
        requestedMaxTokens: validation.adjustedLimits?.maxOutputTokens || 2000
      });

      // Simulate token tracking for streaming
      const chunks = aiResult.response.split(' ');
      for (let i = 0; i < chunks.length; i += 5) {
        const chunk = chunks.slice(i, i + 5).join(' ') + ' ';
        trackStreamingTokens(chunk, i + 5 >= chunks.length);
        
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResult({
        ...aiResult,
        validation,
        costEstimate: getCostEstimate(
          validation.metrics.session.inputTokens,
          validation.metrics.session.outputTokens,
          'openai',
          'gpt-4'
        )
      });

    } catch (error) {
      console.error('💰 AI execution failed:', error);
      alert(`Execution failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleControlLevelChange = (level: 'basic' | 'strict' | 'aggressive') => {
    setControlLevel(level);
    clearWarnings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            💰 BROLOSTACK TOKEN USAGE CONTROL SYSTEM
          </h1>
          <p className="text-xl text-green-300 mb-4">
            The Most Advanced Cost Management System for AI Applications
          </p>
          <div className="flex justify-center items-center space-x-4">
            <span className={`px-4 py-2 rounded-full font-bold ${isAtLimit ? 'bg-red-500 animate-pulse' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'}`}>
              {isAtLimit ? '🚫 AT LIMIT' : isNearLimit ? '⚠️ NEAR LIMIT' : '✅ WITHIN LIMITS'}
            </span>
            <span className="px-4 py-2 bg-blue-800 rounded-full">
              Control: {controlLevel.toUpperCase()}
            </span>
            <span className="px-4 py-2 bg-purple-800 rounded-full">
              ENV: {Environment.current().toUpperCase()}
            </span>
          </div>
        </header>

        {/* Control Level Selection */}
        <div className="bg-black bg-opacity-50 rounded-lg p-6 mb-6 border border-green-500">
          <h2 className="text-2xl font-bold mb-4 text-green-400">💰 Token Control Level</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleControlLevelChange('basic')}
              className={`p-4 rounded-lg border-2 transition-all ${
                controlLevel === 'basic' 
                  ? 'border-green-500 bg-green-900' 
                  : 'border-gray-600 bg-gray-800 hover:border-green-400'
              }`}
            >
              <div className="text-lg font-bold">📊 BASIC</div>
              <div className="text-sm text-gray-300">
                Flexible limits with 10% buffer
              </div>
              <div className="text-xs mt-2">
                • Allows slight overruns<br/>
                • Warns at 80% usage<br/>
                • Best for development
              </div>
            </button>

            <button
              onClick={() => handleControlLevelChange('strict')}
              className={`p-4 rounded-lg border-2 transition-all ${
                controlLevel === 'strict' 
                  ? 'border-yellow-500 bg-yellow-900' 
                  : 'border-gray-600 bg-gray-800 hover:border-yellow-400'
              }`}
            >
              <div className="text-lg font-bold">⚡ STRICT</div>
              <div className="text-sm text-gray-300">
                Enforces exact limits
              </div>
              <div className="text-xs mt-2">
                • No flexibility on limits<br/>
                • Blocks at exact threshold<br/>
                • Best for production
              </div>
            </button>

            <button
              onClick={() => handleControlLevelChange('aggressive')}
              className={`p-4 rounded-lg border-2 transition-all ${
                controlLevel === 'aggressive' 
                  ? 'border-red-500 bg-red-900' 
                  : 'border-gray-600 bg-gray-800 hover:border-red-400'
              }`}
            >
              <div className="text-lg font-bold">🔥 AGGRESSIVE</div>
              <div className="text-sm text-gray-300">
                10% buffer with early cutoff
              </div>
              <div className="text-xs mt-2">
                • Blocks at 90% of limit<br/>
                • Maximum cost protection<br/>
                • Best for cost-sensitive apps
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Usage Monitor */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-green-500">
            <h2 className="text-xl font-bold mb-4 text-green-400">📊 Real-time Token Monitor</h2>
            
            <TokenUsageDisplay
              userId={userId}
              sessionId={sessionId}
              showCost={true}
              showWarnings={true}
              compact={false}
            />

            {metrics && (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-900 rounded">
                    <div className="text-sm text-blue-300">Session Requests</div>
                    <div className="font-bold text-xl">{metrics.session.requestCount}</div>
                  </div>
                  <div className="p-3 bg-purple-900 rounded">
                    <div className="text-sm text-purple-300">Total Cost</div>
                    <div className="font-bold text-xl">${totalCost.toFixed(4)}</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-sm text-gray-300">Remaining Tokens</div>
                  <div className="text-xs space-y-1">
                    <div>Input: {remainingTokens.input} tokens</div>
                    <div>Output: {remainingTokens.output} tokens</div>
                    <div>Total: {remainingTokens.total} tokens</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <button
                onClick={resetUserMetrics}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                🔄 Reset Metrics
              </button>
              <button
                onClick={clearWarnings}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                🧹 Clear Warnings
              </button>
            </div>
          </div>

          {/* Query Interface */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-blue-400">🤖 AI Query Interface</h2>
            
            <TokenUsageGuard
              userId={userId}
              sessionId={sessionId}
              onBlocked={() => console.log('Request blocked by TokenUsageGuard')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">AI Query:</label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your AI query... Token usage will be monitored in real-time"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                    rows={4}
                  />
                  
                  {query && (
                    <div className="mt-2 text-sm text-gray-400">
                      Estimated input tokens: {Math.ceil(query.length / 4)}
                      {shouldBlockRequest(query) && (
                        <span className="text-red-400 ml-2">⚠️ May exceed limits</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleExecuteQuery}
                  disabled={!query.trim() || isProcessing || shouldBlockRequest(query)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                >
                  {isProcessing ? '⏳ Processing with Token Control...' : '🚀 Execute with Token Control'}
                </button>

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
            </TokenUsageGuard>
          </div>

          {/* Results Display */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-400">📈 Token Control Results</h2>
            
            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-900 rounded border border-purple-500">
                  <h4 className="font-bold text-purple-400 mb-2">✅ AI Response:</h4>
                  <div className="text-sm whitespace-pre-wrap">{result.response}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-900 rounded">
                    <div className="text-sm text-green-300">Validation Status</div>
                    <div className="font-bold">
                      {result.validation.allowed ? '✅ Allowed' : '🚫 Blocked'}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-900 rounded">
                    <div className="text-sm text-blue-300">Cost Estimate</div>
                    <div className="font-bold">${result.costEstimate.toFixed(6)}</div>
                  </div>
                </div>

                {result.validation.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-900 rounded border border-yellow-500">
                    <h4 className="font-bold text-yellow-400 mb-2">⚠️ Warnings:</h4>
                    <ul className="text-sm space-y-1">
                      {result.validation.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.validation.adjustedLimits && (
                  <div className="p-4 bg-orange-900 rounded border border-orange-500">
                    <h4 className="font-bold text-orange-400 mb-2">🔧 Adjusted Limits:</h4>
                    <div className="text-sm space-y-1">
                      <div>Max Input: {result.validation.adjustedLimits.maxInputTokens} tokens</div>
                      <div>Max Output: {result.validation.adjustedLimits.maxOutputTokens} tokens</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!result && (
              <div className="text-center py-8 text-gray-400">
                Execute a query to see token control results
              </div>
            )}
          </div>

          {/* Warnings and Alerts */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-yellow-500">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">⚠️ Warnings & Alerts</h2>
            
            {warnings.length > 0 ? (
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="p-3 bg-yellow-900 rounded border border-yellow-500">
                    <div className="text-sm">⚠️ {warning}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No warnings - token usage is within safe limits
              </div>
            )}

            {lastValidation && (
              <div className="mt-4 p-3 bg-gray-800 rounded">
                <h4 className="font-bold text-gray-300 mb-2">Last Validation:</h4>
                <div className="text-sm space-y-1">
                  <div>Status: {lastValidation.allowed ? '✅ Passed' : '🚫 Failed'}</div>
                  <div>Action: {lastValidation.recommendedAction.toUpperCase()}</div>
                  {lastValidation.reason && <div>Reason: {lastValidation.reason}</div>}
                  <div>Cost Estimate: ${lastValidation.costEstimate.toFixed(6)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Level Explanation */}
        <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-6 border border-white">
          <h2 className="text-xl font-bold mb-4">💡 Token Control Levels Explained</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-green-400">📊 BASIC Control</h3>
              <ul className="text-sm space-y-1">
                <li>• Allows 10% buffer above limits</li>
                <li>• Warns at 80% usage</li>
                <li>• Flexible for development</li>
                <li>• Good user experience</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-yellow-400">⚡ STRICT Control</h3>
              <ul className="text-sm space-y-1">
                <li>• Enforces exact token limits</li>
                <li>• No flexibility or overruns</li>
                <li>• Blocks at threshold</li>
                <li>• Perfect for production</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-red-400">🔥 AGGRESSIVE Control</h3>
              <ul className="text-sm space-y-1">
                <li>• Blocks at 90% of limits</li>
                <li>• Maximum cost protection</li>
                <li>• Early cutoff during streaming</li>
                <li>• Best for cost-sensitive apps</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-6 border border-white">
          <h2 className="text-xl font-bold mb-4">🚀 Token Control Features</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-900 rounded">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm">Real-time Monitoring</div>
              <div className="text-xs text-gray-300">Live token tracking</div>
            </div>
            
            <div className="text-center p-3 bg-blue-900 rounded">
              <div className="text-2xl mb-2">✂️</div>
              <div className="text-sm">Automatic Cutoff</div>
              <div className="text-xs text-gray-300">Stream interruption</div>
            </div>
            
            <div className="text-center p-3 bg-purple-900 rounded">
              <div className="text-2xl mb-2">💵</div>
              <div className="text-sm">Cost Management</div>
              <div className="text-xs text-gray-300">Budget protection</div>
            </div>
            
            <div className="text-center p-3 bg-orange-900 rounded">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-sm">Smart Warnings</div>
              <div className="text-xs text-gray-300">Proactive alerts</div>
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
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 text-white flex items-center justify-center">
        <div className="bg-black bg-opacity-50 rounded-lg p-8 border border-green-500 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">💰 Configure Token Control</h1>
          
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
              className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 transition-colors"
            >
              💰 Initialize Token Control System
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrolostackProvider
      appName="token-usage-showcase"
      config={{
        version: '1.0.0',
        enterprise: {
          ai: {
            enabled: true,
            governance: true,
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
                   provider === 'anthropic' ? 'claude-3-sonnet' : 'gemini-pro'
          },
          reasoning: { framework: 'cot' },
          governance: { 
            enabled: true,
            realTimeMonitoring: true,
            safetyFirst: true,
            config: {
              tokenUsage: {
                controlLevel: 'basic',
                limits: {
                  maxInputTokensPerRequest: 4000,
                  maxOutputTokensPerRequest: 2000,
                  maxTotalTokensPerUser: 50000,
                  maxTotalTokensPerSession: 10000,
                  maxTokensPerMinute: 5000,
                  maxTokensPerHour: 20000,
                  maxTokensPerDay: 100000
                },
                monitoring: {
                  realTimeTracking: true,
                  clientSideEnforcement: true,
                  backendValidation: true,
                  automaticCutoff: true,
                  warningThresholds: { input: 80, output: 85, total: 90 }
                },
                costManagement: {
                  enabled: true,
                  maxCostPerRequest: 0.10,
                  maxCostPerUser: 5.00,
                  maxCostPerDay: 50.00,
                  currency: 'USD',
                  providerPricing: {}
                },
                actions: {
                  warnUser: true,
                  blockRequest: true,
                  truncateInput: false,
                  limitOutput: true,
                  logViolation: true,
                  notifyDeveloper: true
                }
              },
              safetyCompliance: {
                hallucinationDetection: { enabled: true, sensitivity: 'high', factCheckingLevel: 'advanced', realTimeValidation: true },
                jailbreakDetection: { enabled: true, patterns: [], behaviorAnalysis: true, contextualAwareness: true },
                toxicLanguageDetection: { enabled: true, categories: ['hate', 'harassment'], threshold: 0.8, multilingual: true },
                privacyCompliance: { enabled: true, regulations: ['GDPR'], piiDetection: true, dataMinimization: true },
                nationalCompliance: { enabled: true, countries: ['US'], legalFrameworks: [], culturalSensitivity: true }
              },
              functionalReadiness: {
                contextDrift: { enabled: true, maxDriftThreshold: 0.3, contextWindowTracking: true, semanticCoherence: true },
                toneMismatch: { enabled: true, expectedTone: 'adaptive', toneConsistency: true, audienceAwareness: true },
                industryReadiness: { enabled: true, industries: ['technology'], domainExpertise: true, terminologyAccuracy: true },
                robustnessReliability: { enabled: true, stressTestingLevel: 'advanced', edgeCaseHandling: true, errorRecovery: true },
                explainabilityTransparency: { enabled: true, reasoningLevel: 'detailed', decisionTracing: true, confidenceScoring: true },
                fraudDetection: { enabled: true, patterns: [], behaviorAnalysis: true, riskAssessment: true }
              },
              advancedDomains: {
                aiAlignment: { enabled: true, humanValues: ['honesty'], goalAlignment: true, valueSystemChecking: true },
                biasFairness: { enabled: true, biasTypes: ['gender'], fairnessMetrics: ['demographic_parity'], mitigationStrategies: true }
              },
              actions: {
                blockUnsafeContent: true,
                logViolations: true,
                alertAdministrators: true,
                gradualDegradation: true,
                userNotification: true,
                automaticCorrection: true
              },
              monitoring: {
                enabled: true,
                realTimeScoring: true,
                dashboardUpdates: true,
                alertThresholds: { 'safety': 0.7, 'bias': 0.8 }
              }
            }
          },
          memory: {
            enabled: true,
            contextWindow: 20,
            semanticSearch: false,
            vectorSearch: false,
            persistentMemory: false
          },
          websocket: {
            enabled: false,
            realTimeUpdates: false,
            multiAgentSupport: false,
            streamingResponses: false
          },
          backend: {
            enabled: false,
            framework: 'none',
            endpoints: [],
            authentication: false
          },
          tools: {
            enabled: false,
            allowedTools: [],
            externalAPIs: {},
            customTools: {}
          },
          performance: {
            caching: true,
            parallelProcessing: false,
            responseStreaming: false,
            optimizedPrompts: true
          }
        }}
      >
        <TokenUsageDashboard />
      </BrolostackAIProvider>
    </BrolostackProvider>
  );
}

export default App;
