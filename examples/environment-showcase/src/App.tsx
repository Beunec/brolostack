/**
 * Environment Showcase App
 * Demonstrates Brolostack's seamless environment switching
 */

import React, { useState, useEffect } from 'react';
import { 
  Brolostack, 
  Environment, 
  EnvironmentUtils,
  BrolostackProvider, 
  useBrolostack,
  useBrolostackStore 
} from 'brolostack';

// Import the environment-optimized configuration
const config = require('../brolostack.config.js');

function EnvironmentDashboard() {
  const { app } = useBrolostack();
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  
  // Create a store to demonstrate environment-aware storage
  const settingsStore = useBrolostackStore('settings', {
    theme: 'light',
    notifications: true,
    cacheEnabled: EnvironmentUtils.shouldEnable.caching(),
    encryptionEnabled: EnvironmentUtils.shouldEnable.encryption()
  });

  useEffect(() => {
    // Get comprehensive environment information
    const info = EnvironmentUtils.getEnvironmentInfo();
    const appStats = app.getStats();
    const envValidation = EnvironmentUtils.validateEnvironment();
    
    setEnvInfo(info);
    setStats(appStats);
    setValidation(envValidation);
    
    // Log environment info (will only show in development)
    EnvironmentUtils.log.info('Environment Dashboard loaded', {
      environment: info.current,
      features: {
        caching: EnvironmentUtils.shouldEnable.caching(),
        encryption: EnvironmentUtils.shouldEnable.encryption(),
        analytics: EnvironmentUtils.shouldEnable.analytics(),
        errorTracking: EnvironmentUtils.shouldEnable.errorTracking()
      }
    });
  }, [app]);

  const handleTestError = () => {
    try {
      throw new Error('Test error for environment-aware handling');
    } catch (error) {
      EnvironmentUtils.handleError(error as Error, {
        component: 'EnvironmentDashboard',
        action: 'testError',
        userAgent: navigator.userAgent
      });
    }
  };

  const handlePerformanceTest = () => {
    const timer = new EnvironmentUtils.PerformanceTimer('Demo Operation');
    
    // Simulate some work
    setTimeout(() => {
      timer.end({
        operation: 'demo',
        itemsProcessed: 100,
        cacheHit: Math.random() > 0.5
      });
    }, Math.random() * 1000);
  };

  const getEnvironmentBadge = (env: string) => {
    const colors = {
      development: 'bg-green-100 text-green-800',
      testing: 'bg-yellow-100 text-yellow-800',
      staging: 'bg-orange-100 text-orange-800',
      production: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[env as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {env.toUpperCase()}
      </span>
    );
  };

  if (!envInfo || !stats) {
    return <div className="p-8">Loading environment information...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Brolostack Environment Showcase
          </h1>
          <div className="flex items-center space-x-4">
            {getEnvironmentBadge(envInfo.current)}
            <span className="text-gray-600">
              Debug Mode: {envInfo.isDevelopment ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        </header>

        {/* Environment Validation */}
        {validation && (
          <div className="mb-6">
            {validation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-red-800 font-semibold mb-2">Environment Errors</h3>
                <ul className="text-red-700 text-sm">
                  {validation.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-yellow-800 font-semibold mb-2">Environment Warnings</h3>
                <ul className="text-yellow-700 text-sm">
                  {validation.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Environment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Current Environment:</span>
                <span>{envInfo.current}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">NODE_ENV:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {envInfo.nodeEnv || 'undefined'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">BROLOSTACK_ENV:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {envInfo.brolostackEnv || 'undefined'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Debug Mode:</span>
                <span>{envInfo.isDevelopment ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          {/* Performance Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Configuration</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Minification:</span>
                <span>{stats.environment.performance.shouldMinify ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Compression:</span>
                <span>{stats.environment.performance.shouldCompress ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tree Shaking:</span>
                <span>{stats.environment.performance.shouldTreeShake ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Caching:</span>
                <span>{stats.environment.performance.shouldCache ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cache Strategy:</span>
                <span className="capitalize">{stats.environment.performance.cacheStrategy}</span>
              </div>
            </div>
          </div>

          {/* Security Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Security Configuration</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Detailed Errors:</span>
                <span>{stats.environment.security.showDetailedErrors ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Stack Traces:</span>
                <span>{stats.environment.security.showStackTraces ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Console Logging:</span>
                <span>{stats.environment.security.enableConsoleLogging ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">CORS:</span>
                <span>{stats.environment.security.corsConfig.enabled ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">CSP:</span>
                <span>{stats.environment.security.cspConfig.enabled ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          {/* Application Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Application Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Uptime:</span>
                <span>{Math.round(stats.uptime / 1000)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Stores:</span>
                <span>{stats.stores}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">AI Agents:</span>
                <span>{stats.aiAgents}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Storage Size:</span>
                <span>{(stats.storageSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Version:</span>
                <span>{stats.version}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Testing */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Testing</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleTestError}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Test Error Handling
            </button>
            <button
              onClick={handlePerformanceTest}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Test Performance Monitoring
            </button>
            <button
              onClick={() => settingsStore.actions.toggle('notifications')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Toggle Notifications: {settingsStore.state.notifications ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Settings Store (Environment-Aware):</h3>
            <pre className="text-sm text-gray-700">
              {JSON.stringify(settingsStore.state, null, 2)}
            </pre>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Available Variables:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• NODE_ENV</div>
                <div>• BROLOSTACK_ENV</div>
                <div>• AWS_REGION</div>
                <div>• AWS_ACCESS_KEY_ID</div>
                <div>• AZURE_API_KEY</div>
                <div>• ALLOWED_ORIGINS</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Current Values:</h3>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                <div>NODE_ENV: {process.env.NODE_ENV || 'undefined'}</div>
                <div>BROLOSTACK_ENV: {process.env.BROLOSTACK_ENV || 'undefined'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrolostackProvider
      appName="environment-showcase"
      config={config}
    >
      <EnvironmentDashboard />
    </BrolostackProvider>
  );
}

export default App;
