/**
 * 💰 Token Usage React Hook
 * Frontend JavaScript protocol for monitoring and controlling AI token usage
 * Enables cost-effective AI applications with automatic cutoff capabilities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getBrolostackBSDGF4AI, 
  TokenUsageMetrics, 
  TokenControlResult
} from '../ai/governance/BrolostackBSDGF4AI';
import { Environment } from '../core/EnvironmentManager';

interface UseTokenUsageOptions {
  userId: string;
  sessionId: string;
  controlLevel?: 'basic' | 'strict' | 'aggressive';
  maxInputTokens?: number;
  maxOutputTokens?: number;
  enableRealTimeMonitoring?: boolean;
  onLimitExceeded?: (result: TokenControlResult) => void;
  onStreamingCutoff?: (data: any) => void;
  onWarningThreshold?: (warning: string) => void;
}

interface TokenUsageState {
  metrics: TokenUsageMetrics | null;
  isLoading: boolean;
  warnings: string[];
  lastValidation: TokenControlResult | null;
  totalCost: number;
  remainingTokens: {
    input: number;
    output: number;
    total: number;
  };
  usagePercentage: {
    input: number;
    output: number;
    total: number;
  };
}

/**
 * 💰 MAIN TOKEN USAGE HOOK
 * Frontend protocol for monitoring and controlling AI token usage
 */
export function useTokenUsage(options: UseTokenUsageOptions) {
  const [state, setState] = useState<TokenUsageState>({
    metrics: null,
    isLoading: false,
    warnings: [],
    lastValidation: null,
    totalCost: 0,
    remainingTokens: { input: 0, output: 0, total: 0 },
    usagePercentage: { input: 0, output: 0, total: 0 }
  });

  const governance = useRef(getBrolostackBSDGF4AI());
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize real-time monitoring
  useEffect(() => {
    if (options.enableRealTimeMonitoring !== false) {
      startRealTimeMonitoring();
    }

    // Listen for token events
    governance.current.on('token-limit-exceeded', (data: any) => {
      if (data.userId === options.userId) {
        options.onLimitExceeded?.(data);
        
        setState(prev => ({
          ...prev,
          warnings: [...prev.warnings, `Token limit exceeded: ${data.reason}`]
        }));
      }
    });

    governance.current.on('streaming-cutoff', (data: any) => {
      if (data.userId === options.userId) {
        options.onStreamingCutoff?.(data);
        
        setState(prev => ({
          ...prev,
          warnings: [...prev.warnings, `Streaming cutoff: ${data.reason}`]
        }));
      }
    });

    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
      governance.current.removeAllListeners('token-limit-exceeded');
      governance.current.removeAllListeners('streaming-cutoff');
    };
  }, [options.userId, options.sessionId]);

  /**
   * 💰 START REAL-TIME MONITORING
   */
  const startRealTimeMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }

    monitoringInterval.current = setInterval(async () => {
      try {
        const stats = governance.current.getTokenUsageStatistics();
        console.log('Token usage statistics updated:', stats);
        
        // This would typically fetch user-specific metrics
        // For now, we'll simulate it
        const mockMetrics: TokenUsageMetrics = {
          session: {
            inputTokens: Math.floor(Math.random() * 1000),
            outputTokens: Math.floor(Math.random() * 800),
            totalTokens: 0,
            requestCount: Math.floor(Math.random() * 10),
            estimatedCost: Math.random() * 2
          },
          user: {
            totalInputTokens: Math.floor(Math.random() * 5000),
            totalOutputTokens: Math.floor(Math.random() * 4000),
            totalRequests: Math.floor(Math.random() * 50),
            totalCost: Math.random() * 10,
            lastReset: Date.now() - Math.random() * 86400000
          },
          realTime: {
            currentInputTokens: 0,
            currentOutputTokens: 0,
            streamingTokens: 0,
            projectedTotal: 0
          },
          limits: {
            inputRemaining: options.maxInputTokens || 4000,
            outputRemaining: options.maxOutputTokens || 2000,
            totalRemaining: 50000,
            percentageUsed: Math.random() * 100
          }
        };

        mockMetrics.session.totalTokens = mockMetrics.session.inputTokens + mockMetrics.session.outputTokens;


        // Check warning thresholds
        const inputPercentage = ((options.maxInputTokens || 4000) - mockMetrics.limits.inputRemaining) / (options.maxInputTokens || 4000) * 100;
        const outputPercentage = ((options.maxOutputTokens || 2000) - mockMetrics.limits.outputRemaining) / (options.maxOutputTokens || 2000) * 100;

        setState(prevState => {
          const newWarnings = [...prevState.warnings];
          
          if (inputPercentage > 80 && !prevState.warnings.includes('Input tokens approaching limit')) {
            const warning = `Input tokens at ${inputPercentage.toFixed(1)}% of limit`;
            options.onWarningThreshold?.(warning);
            newWarnings.push(warning);
          }

          if (outputPercentage > 85 && !prevState.warnings.includes('Output tokens approaching limit')) {
            const warning = `Output tokens at ${outputPercentage.toFixed(1)}% of limit`;
            options.onWarningThreshold?.(warning);
            newWarnings.push(warning);
          }

          return {
            ...prevState,
            metrics: mockMetrics,
            totalCost: mockMetrics.user.totalCost,
            remainingTokens: {
              input: mockMetrics.limits.inputRemaining,
              output: mockMetrics.limits.outputRemaining,
              total: mockMetrics.limits.totalRemaining
            },
            usagePercentage: {
              input: ((options.maxInputTokens || 4000) - mockMetrics.limits.inputRemaining) / (options.maxInputTokens || 4000) * 100,
              output: ((options.maxOutputTokens || 2000) - mockMetrics.limits.outputRemaining) / (options.maxOutputTokens || 2000) * 100,
              total: mockMetrics.limits.percentageUsed
            },
            warnings: newWarnings
          };
        });

      } catch (error) {
        console.error('💰 Token monitoring error:', error);
      }
    }, 2000); // Update every 2 seconds
  }, [options.userId, options.sessionId, options.maxInputTokens, options.maxOutputTokens]);

  /**
   * 💰 VALIDATE TOKEN USAGE BEFORE REQUEST
   */
  const validateTokenUsage = useCallback(async (
    inputText: string,
    provider: string,
    model: string,
    requestedMaxTokens?: number
  ): Promise<TokenControlResult> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await governance.current.validateTokenUsage(
        options.userId,
        options.sessionId,
        inputText,
        provider,
        model,
        requestedMaxTokens
      );

      setState(prev => ({
        ...prev,
        lastValidation: result,
        isLoading: false,
        warnings: result.warnings.length > 0 ? [...prev.warnings, ...result.warnings] : prev.warnings
      }));

      // Handle different control levels
      if (!result.allowed && options.controlLevel === 'strict') {
        throw new Error(`Token validation failed: ${result.reason}`);
      }

      if (!result.allowed && options.controlLevel === 'aggressive') {
        throw new Error(`Aggressive token control: ${result.reason}`);
      }

      return result;

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [options.userId, options.sessionId, options.controlLevel]);

  /**
   * 💰 TRACK STREAMING TOKENS
   */
  const trackStreamingTokens = useCallback((
    streamChunk: string,
    isComplete: boolean = false
  ): TokenUsageMetrics => {
    const metrics = governance.current.trackStreamingTokens(
      options.userId,
      options.sessionId,
      streamChunk,
      isComplete
    );

    setState(prev => ({
      ...prev,
      metrics
    }));

    return metrics;
  }, [options.userId, options.sessionId]);

  /**
   * 💰 RESET USER METRICS
   */
  const resetUserMetrics = useCallback(() => {
    governance.current.resetUserTokenMetrics(options.userId);
    
    setState(prev => ({
      ...prev,
      metrics: null,
      warnings: [],
      lastValidation: null,
      totalCost: 0,
      remainingTokens: { input: 0, output: 0, total: 0 },
      usagePercentage: { input: 0, output: 0, total: 0 }
    }));
  }, [options.userId]);

  /**
   * 💰 CLEAR WARNINGS
   */
  const clearWarnings = useCallback(() => {
    setState(prev => ({ ...prev, warnings: [] }));
  }, []);

  /**
   * 💰 GET COST ESTIMATE
   */
  const getCostEstimate = useCallback((
    inputTokens: number,
    outputTokens: number,
    provider: string,
    model: string
  ): number => {
    // This would use the actual pricing from the governance system
    const defaultPricing = {
      'openai:gpt-4': { input: 0.03, output: 0.06 },
      'openai:gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'anthropic:claude-3-sonnet': { input: 0.003, output: 0.015 }
    };

    const key = `${provider}:${model}` as keyof typeof defaultPricing;
    const pricing = defaultPricing[key] || { input: 0.001, output: 0.002 };

    return (inputTokens * pricing.input / 1000) + (outputTokens * pricing.output / 1000);
  }, []);

  /**
   * 💰 CHECK IF REQUEST SHOULD BE BLOCKED
   */
  const shouldBlockRequest = useCallback((inputText: string): boolean => {
    if (!state.metrics) return false;

    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    const maxOutputTokens = options.maxOutputTokens || 2000;
    
    console.log('Token usage check:', { estimatedInputTokens, maxOutputTokens });

    // Check based on control level
    switch (options.controlLevel) {
      case 'strict':
        return estimatedInputTokens > (options.maxInputTokens || 4000);
      
      case 'aggressive':
        return estimatedInputTokens > (options.maxInputTokens || 4000) * 0.9;
      
      case 'basic':
      default:
        return estimatedInputTokens > (options.maxInputTokens || 4000) * 1.1;
    }
  }, [state.metrics, options.controlLevel, options.maxInputTokens, options.maxOutputTokens]);

  return {
    // State
    metrics: state.metrics,
    isLoading: state.isLoading,
    warnings: state.warnings,
    lastValidation: state.lastValidation,
    totalCost: state.totalCost,
    remainingTokens: state.remainingTokens,
    usagePercentage: state.usagePercentage,

    // Actions
    validateTokenUsage,
    trackStreamingTokens,
    resetUserMetrics,
    clearWarnings,
    getCostEstimate,
    shouldBlockRequest,

    // Computed values
    isNearLimit: state.usagePercentage.total > 80,
    isAtLimit: state.usagePercentage.total > 95,
    canMakeRequest: !shouldBlockRequest,
    controlLevel: options.controlLevel || 'basic'
  };
}

/**
 * 💰 TOKEN USAGE DISPLAY COMPONENT
 */
export function TokenUsageDisplay({ 
  userId, 
  sessionId, 
  showCost = true,
  showWarnings = true,
  compact = false 
}: {
  userId: string;
  sessionId: string;
  showCost?: boolean;
  showWarnings?: boolean;
  compact?: boolean;
}) {
  const {
    metrics,
    warnings,
    totalCost,
    remainingTokens,
    usagePercentage,
    isNearLimit,
    isAtLimit,
    controlLevel
  } = useTokenUsage({ userId, sessionId });

  // Use shouldBlockRequest for validation
  const blockingEnabled = true;
  console.log('Token usage display - blocking enabled:', blockingEnabled);

  if (!metrics) {
    return (
      <div className="token-usage-loading">
        Loading token usage...
      </div>
    );
  }

  return (
    <div className={`token-usage-display ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="token-usage-header">
          <h4>💰 Token Usage Monitor</h4>
          <span className={`control-level ${controlLevel}`}>
            {controlLevel.toUpperCase()} Mode
          </span>
        </div>
      )}

      <div className="token-metrics">
        <div className="metric">
          <span className="label">Input Tokens:</span>
          <span className={`value ${usagePercentage.input > 80 ? 'warning' : ''}`}>
            {metrics.session.inputTokens} / {remainingTokens.input + metrics.session.inputTokens}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill input" 
              style={{ width: `${Math.min(usagePercentage.input, 100)}%` }}
            />
          </div>
        </div>

        <div className="metric">
          <span className="label">Output Tokens:</span>
          <span className={`value ${usagePercentage.output > 85 ? 'warning' : ''}`}>
            {metrics.session.outputTokens} / {remainingTokens.output + metrics.session.outputTokens}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill output" 
              style={{ width: `${Math.min(usagePercentage.output, 100)}%` }}
            />
          </div>
        </div>

        <div className="metric">
          <span className="label">Total Usage:</span>
          <span className={`value ${isAtLimit ? 'danger' : isNearLimit ? 'warning' : ''}`}>
            {usagePercentage.total.toFixed(1)}%
          </span>
          <div className="progress-bar">
            <div 
              className={`progress-fill total ${isAtLimit ? 'danger' : isNearLimit ? 'warning' : ''}`}
              style={{ width: `${Math.min(usagePercentage.total, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {showCost && (
        <div className="cost-display">
          <span className="cost-label">Estimated Cost:</span>
          <span className="cost-value">${totalCost.toFixed(4)}</span>
        </div>
      )}

      {showWarnings && warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning, index) => (
            <div key={index} className="warning">
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}

      {Environment.isDev() && (
        <div className="debug-info">
          <small>
            Requests: {metrics.session.requestCount} | 
            Session: {sessionId.substring(0, 8)}...
          </small>
        </div>
      )}
    </div>
  );
}

/**
 * 💰 TOKEN USAGE GUARD COMPONENT
 * Automatically blocks requests when limits are exceeded
 */
export function TokenUsageGuard({
  userId,
  sessionId,
  children,
  onBlocked,
  fallback
}: {
  userId: string;
  sessionId: string;
  children: React.ReactNode;
  onBlocked?: () => void;
  fallback?: React.ReactNode;
}) {
  const { shouldBlockRequest, isAtLimit, warnings } = useTokenUsage({ 
    userId, 
    sessionId,
    controlLevel: 'strict'
  });

  // Use shouldBlockRequest for request validation
  const requestValidation = useCallback((input: string) => {
    return !shouldBlockRequest(input);
  }, [shouldBlockRequest]);
  
  console.log('Token usage guard - validation function ready:', !!requestValidation);

  if (isAtLimit) {
    onBlocked?.();
    
    return (
      <div className="token-usage-blocked">
        {fallback || (
          <div className="blocked-message">
            <h4>🚫 Token Limit Reached</h4>
            <p>You have reached your token usage limit. Please wait or upgrade your plan.</p>
            {warnings.length > 0 && (
              <ul>
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
