/**
 * Brolostack Environment Utilities
 * Helper functions for environment-specific operations
 */

import { Environment, environmentManager } from '../core/EnvironmentManager';
import { BrolostackConfig } from '../types';

/**
 * Create environment-optimized Brolostack configuration
 */
export function createEnvironmentConfig(baseConfig: Partial<BrolostackConfig>): BrolostackConfig {
  const envConfig = environmentManager.getConfig();
  
  // Base configuration with environment-specific defaults
  const config: BrolostackConfig = {
    appName: baseConfig.appName || 'brolostack-app',
    version: baseConfig.version || '1.0.0',
    debug: envConfig.debug,
    storageEngine: envConfig.storage.engine,
    encryption: envConfig.storage.encryption,
    compression: envConfig.storage.compression,
    maxStorageSize: envConfig.storage.maxSize,
    ...baseConfig
  };
  
  // Apply environment-specific enterprise configurations
  if (!config.enterprise) {
    config.enterprise = {};
  }
  
  // Security configuration based on environment
  config.enterprise.security = {
    enabled: envConfig.security.enableCSP || envConfig.security.enableCORS,
    encryption: {
      enabled: envConfig.storage.encryption,
      algorithm: envConfig.storage.encryption ? 'AES-GCM' : undefined
    },
    ...config.enterprise.security
  };
  
  // Cloud configuration based on environment
  config.enterprise.cloud = {
    enabled: envConfig.cloud.enableCloudSync,
    syncStrategy: envConfig.cloud.syncStrategy,
    backup: {
      enabled: envConfig.cloud.enableBackup,
      frequency: envConfig.cloud.backupFrequency
    },
    ...config.enterprise.cloud
  };
  
  // Worker configuration for performance optimization
  config.enterprise.worker = {
    enabled: envConfig.performance.bundleOptimization,
    security: {
      encryption: {
        enabled: envConfig.storage.encryption
      }
    },
    ...config.enterprise.worker
  };
  
  // MRM (Multi-Rendering Mode) configuration
  config.enterprise.mrm = {
    enabled: Environment.isProd() || Environment.isStaging(),
    mode: Environment.isProd() ? 'ssr' : 'hybrid',
    cacheStrategy: envConfig.performance.cacheStrategy,
    ...config.enterprise.mrm
  };
  
  return config;
}

/**
 * Environment-aware console logging
 */
export const log = {
  info: (message: string, data?: any) => {
    Environment.log('info', message, data);
  },
  
  warn: (message: string, data?: any) => {
    Environment.log('warn', message, data);
  },
  
  error: (message: string, data?: any) => {
    Environment.log('error', message, data);
  },
  
  debug: (message: string, data?: any) => {
    if (Environment.isDev()) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
  
  performance: (operation: string, startTime: number, data?: any) => {
    const duration = performance.now() - startTime;
    const envConfig = environmentManager.getConfig();
    
    if (envConfig.monitoring.enablePerformanceMonitoring) {
      Environment.log('info', `Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...data
      });
    }
  }
};

/**
 * Environment-aware error handling
 */
export const handleError = (error: Error, context?: any) => {
  Environment.handleError(error, context);
};

/**
 * Check if feature should be enabled based on environment
 */
export const shouldEnable = {
  detailedErrors: () => environmentManager.getSecurityConfig().showDetailedErrors,
  consoleLogging: () => environmentManager.getSecurityConfig().enableConsoleLogging,
  sourceMapping: () => environmentManager.getSecurityConfig().enableSourceMaps,
  analytics: () => environmentManager.getConfig().monitoring.enableAnalytics,
  errorTracking: () => environmentManager.getConfig().monitoring.enableErrorTracking,
  performanceMonitoring: () => environmentManager.getConfig().monitoring.enablePerformanceMonitoring,
  caching: () => environmentManager.getConfig().performance.enableCaching,
  compression: () => environmentManager.getConfig().performance.enableCompression,
  encryption: () => environmentManager.getConfig().storage.encryption
};

/**
 * Get environment-specific API configuration
 */
export function getApiConfig() {
  const envConfig = environmentManager.getConfig();
  
  return {
    timeout: envConfig.api.requestTimeout,
    retryAttempts: envConfig.api.retryAttempts,
    enableMocking: envConfig.api.enableMocking,
    enableRateLimiting: envConfig.api.enableRateLimiting,
    enableRequestLogging: envConfig.api.enableRequestLogging
  };
}

/**
 * Get environment-specific storage configuration
 */
export function getStorageConfig() {
  const envConfig = environmentManager.getConfig();
  
  return {
    engine: envConfig.storage.engine,
    encryption: envConfig.storage.encryption,
    compression: envConfig.storage.compression,
    maxSize: envConfig.storage.maxSize,
    persistentCache: envConfig.storage.persistentCache
  };
}

/**
 * Get environment-specific security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  const secConfig = environmentManager.getSecurityConfig();
  const headers: Record<string, string> = {};
  
  if (secConfig.cspConfig.enabled) {
    headers['Content-Security-Policy'] = secConfig.cspConfig.policy;
  }
  
  if (Environment.isProd() || Environment.isStaging()) {
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Frame-Options'] = 'DENY';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }
  
  return headers;
}

/**
 * Get CORS configuration for current environment
 */
export function getCorsConfig() {
  const secConfig = environmentManager.getSecurityConfig();
  
  return {
    enabled: secConfig.corsConfig.enabled,
    origins: secConfig.corsConfig.origins,
    methods: Environment.isDev() 
      ? ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
      : ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: Environment.isDev()
      ? ['*']
      : ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: !Environment.isDev()
  };
}

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
  private startTime: number;
  private operation: string;
  
  constructor(operation: string) {
    this.operation = operation;
    this.startTime = performance.now();
  }
  
  end(data?: any) {
    log.performance(this.operation, this.startTime, data);
  }
}

/**
 * Environment-aware caching utilities
 */
export const cache = {
  shouldCache: () => environmentManager.getConfig().performance.enableCaching,
  
  getStrategy: () => environmentManager.getConfig().performance.cacheStrategy,
  
  getTTL: (defaultTTL: number = 300000) => { // 5 minutes default
    const strategy = cache.getStrategy();
    switch (strategy) {
      case 'aggressive':
        return defaultTTL * 4; // 20 minutes
      case 'moderate':
        return defaultTTL * 2; // 10 minutes
      case 'minimal':
        return defaultTTL; // 5 minutes
      case 'none':
      default:
        return 0;
    }
  }
};

/**
 * Environment-specific build optimizations
 */
export const buildOptimizations = {
  shouldMinify: () => environmentManager.getPerformanceOptimizations().shouldMinify,
  shouldCompress: () => environmentManager.getPerformanceOptimizations().shouldCompress,
  shouldTreeShake: () => environmentManager.getPerformanceOptimizations().shouldTreeShake,
  shouldLazyLoad: () => environmentManager.getPerformanceOptimizations().shouldLazyLoad,
  
  getCompressionLevel: () => {
    if (Environment.isProd()) return 9; // Maximum compression
    if (Environment.isStaging()) return 6; // Balanced
    return 1; // Minimal compression for dev/test
  }
};

/**
 * Environment information for debugging
 */
export function getEnvironmentInfo() {
  return {
    current: Environment.current(),
    nodeEnv: process.env['NODE_ENV'],
    brolostackEnv: process.env['BROLOSTACK_ENV'],
    isDevelopment: Environment.isDev(),
    isTesting: Environment.isTest(),
    isStaging: Environment.isStaging(),
    isProduction: Environment.isProd(),
    config: Environment.config(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate environment setup
 */
export function validateEnvironment(): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check NODE_ENV
  if (!process.env['NODE_ENV']) {
    warnings.push('NODE_ENV is not set, defaulting to development');
  }
  
  // Production-specific validations
  if (Environment.isProd()) {
    if (Environment.config().debug) {
      warnings.push('Debug mode is enabled in production');
    }
    
    if (!Environment.config().storage.encryption) {
      warnings.push('Storage encryption is disabled in production');
    }
    
    if (Environment.config().security.enableDetailedErrors) {
      errors.push('Detailed errors are enabled in production (security risk)');
    }
  }
  
  // Development-specific validations
  if (Environment.isDev()) {
    if (!Environment.config().debug) {
      warnings.push('Debug mode is disabled in development');
    }
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

// Export all utilities
export default {
  createEnvironmentConfig,
  log,
  handleError,
  shouldEnable,
  getApiConfig,
  getStorageConfig,
  getSecurityHeaders,
  getCorsConfig,
  PerformanceTimer,
  cache,
  buildOptimizations,
  getEnvironmentInfo,
  validateEnvironment
};
