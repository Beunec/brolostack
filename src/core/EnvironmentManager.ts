/**
 * Brolostack Environment Manager
 * Seamless Development, Testing, and Production Environment Management
 * 
 * Features:
 * - Automatic environment detection
 * - Environment-specific optimizations
 * - Smooth environment switching
 * - Performance optimizations per environment
 * - Security configurations per environment
 */

import { Logger } from '../utils/Logger';
import { BrolostackConfig } from '../types';

export type BrolostackEnvironment = 'development' | 'testing' | 'staging' | 'production';

export interface EnvironmentConfig {
  // Core environment settings
  environment: BrolostackEnvironment;
  debug: boolean;
  
  // Performance settings
  performance: {
    enableMinification: boolean;
    enableCompression: boolean;
    enableTreeShaking: boolean;
    enableCaching: boolean;
    cacheStrategy: 'aggressive' | 'moderate' | 'minimal' | 'none';
    bundleOptimization: boolean;
    lazyLoading: boolean;
  };
  
  // Security settings
  security: {
    enableDetailedErrors: boolean;
    enableStackTraces: boolean;
    enableConsoleLogging: boolean;
    enableSourceMaps: boolean;
    enableCORS: boolean;
    corsOrigins: string[] | '*';
    enableCSP: boolean;
    cspPolicy: string;
  };
  
  // Storage settings
  storage: {
    engine: 'localStorage' | 'indexedDB' | 'memory';
    encryption: boolean;
    compression: boolean;
    maxSize: number;
    persistentCache: boolean;
  };
  
  // API settings
  api: {
    enableMocking: boolean;
    enableRateLimiting: boolean;
    requestTimeout: number;
    retryAttempts: number;
    enableRequestLogging: boolean;
  };
  
  // Cloud settings
  cloud: {
    enableCloudSync: boolean;
    syncStrategy: 'real-time' | 'batch' | 'manual';
    enableBackup: boolean;
    backupFrequency: number;
    enableMultiCloud: boolean;
  };
  
  // Monitoring settings
  monitoring: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableUserTracking: boolean;
    sampleRate: number;
  };
}

export class EnvironmentManager {
  private logger: Logger;
  private currentEnvironment: BrolostackEnvironment;
  private config: EnvironmentConfig;
  
  constructor() {
    this.currentEnvironment = this.detectEnvironment();
    this.logger = new Logger(this.isDevelopment(), 'EnvironmentManager');
    this.config = this.createEnvironmentConfig(this.currentEnvironment);
    
    this.logger.info(`Brolostack Environment: ${this.currentEnvironment}`, {
      config: this.config,
      nodeEnv: process.env['NODE_ENV'] || 'undefined',
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Automatically detect the current environment
   */
  private detectEnvironment(): BrolostackEnvironment {
    // Check explicit environment variables first
    if (process.env['BROLOSTACK_ENV']) {
      const env = process.env['BROLOSTACK_ENV'].toLowerCase();
      if (['development', 'testing', 'staging', 'production'].includes(env)) {
        return env as BrolostackEnvironment;
      }
    }
    
    // Fallback to NODE_ENV
    const nodeEnv = process.env['NODE_ENV']?.toLowerCase();
    switch (nodeEnv) {
      case 'development':
      case 'dev':
        return 'development';
      case 'test':
      case 'testing':
        return 'testing';
      case 'staging':
      case 'stage':
        return 'staging';
      case 'production':
      case 'prod':
        return 'production';
      default:
        // Default to development for safety
        return 'development';
    }
  }
  
  /**
   * Create environment-specific configuration
   */
  private createEnvironmentConfig(env: BrolostackEnvironment): EnvironmentConfig {
    const baseConfig: EnvironmentConfig = {
      environment: env,
      debug: false,
      performance: {
        enableMinification: false,
        enableCompression: false,
        enableTreeShaking: false,
        enableCaching: false,
        cacheStrategy: 'none',
        bundleOptimization: false,
        lazyLoading: false
      },
      security: {
        enableDetailedErrors: false,
        enableStackTraces: false,
        enableConsoleLogging: false,
        enableSourceMaps: false,
        enableCORS: false,
        corsOrigins: [],
        enableCSP: false,
        cspPolicy: ''
      },
      storage: {
        engine: 'memory',
        encryption: false,
        compression: false,
        maxSize: 10, // MB
        persistentCache: false
      },
      api: {
        enableMocking: false,
        enableRateLimiting: false,
        requestTimeout: 5000,
        retryAttempts: 1,
        enableRequestLogging: false
      },
      cloud: {
        enableCloudSync: false,
        syncStrategy: 'manual',
        enableBackup: false,
        backupFrequency: 0,
        enableMultiCloud: false
      },
      monitoring: {
        enableAnalytics: false,
        enableErrorTracking: false,
        enablePerformanceMonitoring: false,
        enableUserTracking: false,
        sampleRate: 0
      }
    };
    
    // Apply environment-specific overrides
    switch (env) {
      case 'development':
        return {
          ...baseConfig,
          debug: true,
          performance: {
            ...baseConfig.performance,
            enableCaching: true,
            cacheStrategy: 'minimal',
            lazyLoading: true
          },
          security: {
            ...baseConfig.security,
            enableDetailedErrors: true,
            enableStackTraces: true,
            enableConsoleLogging: true,
            enableSourceMaps: true,
            enableCORS: true,
            corsOrigins: '*'
          },
          storage: {
            ...baseConfig.storage,
            engine: 'localStorage',
            maxSize: 50,
            persistentCache: true
          },
          api: {
            ...baseConfig.api,
            enableMocking: true,
            requestTimeout: 10000,
            retryAttempts: 3,
            enableRequestLogging: true
          },
          cloud: {
            ...baseConfig.cloud,
            enableCloudSync: true,
            syncStrategy: 'manual'
          },
          monitoring: {
            ...baseConfig.monitoring,
            enableErrorTracking: true,
            enablePerformanceMonitoring: true,
            sampleRate: 1.0
          }
        };
        
      case 'testing':
        return {
          ...baseConfig,
          debug: true,
          performance: {
            ...baseConfig.performance,
            enableCaching: true,
            cacheStrategy: 'minimal'
          },
          security: {
            ...baseConfig.security,
            enableDetailedErrors: true,
            enableStackTraces: true,
            enableConsoleLogging: false, // Reduce noise in tests
            enableSourceMaps: true
          },
          storage: {
            ...baseConfig.storage,
            engine: 'memory', // Use memory for fast, isolated tests
            maxSize: 10
          },
          api: {
            ...baseConfig.api,
            enableMocking: true,
            requestTimeout: 5000,
            retryAttempts: 1,
            enableRequestLogging: false
          },
          monitoring: {
            ...baseConfig.monitoring,
            enableErrorTracking: true,
            sampleRate: 1.0
          }
        };
        
      case 'staging':
        return {
          ...baseConfig,
          debug: false,
          performance: {
            ...baseConfig.performance,
            enableMinification: true,
            enableCompression: true,
            enableCaching: true,
            cacheStrategy: 'moderate',
            bundleOptimization: true,
            lazyLoading: true
          },
          security: {
            ...baseConfig.security,
            enableDetailedErrors: false,
            enableStackTraces: false,
            enableConsoleLogging: false,
            enableSourceMaps: false,
            enableCORS: true,
            corsOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || [],
            enableCSP: true,
            cspPolicy: "default-src 'self'"
          },
          storage: {
            ...baseConfig.storage,
            engine: 'indexedDB',
            encryption: true,
            compression: true,
            maxSize: 100,
            persistentCache: true
          },
          api: {
            ...baseConfig.api,
            enableRateLimiting: true,
            requestTimeout: 8000,
            retryAttempts: 2,
            enableRequestLogging: false
          },
          cloud: {
            ...baseConfig.cloud,
            enableCloudSync: true,
            syncStrategy: 'batch',
            enableBackup: true,
            backupFrequency: 3600000, // 1 hour
            enableMultiCloud: true
          },
          monitoring: {
            ...baseConfig.monitoring,
            enableAnalytics: true,
            enableErrorTracking: true,
            enablePerformanceMonitoring: true,
            sampleRate: 0.5
          }
        };
        
      case 'production':
        return {
          ...baseConfig,
          debug: false,
          performance: {
            ...baseConfig.performance,
            enableMinification: true,
            enableCompression: true,
            enableTreeShaking: true,
            enableCaching: true,
            cacheStrategy: 'aggressive',
            bundleOptimization: true,
            lazyLoading: true
          },
          security: {
            ...baseConfig.security,
            enableDetailedErrors: false,
            enableStackTraces: false,
            enableConsoleLogging: false,
            enableSourceMaps: false,
            enableCORS: true,
            corsOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || [],
            enableCSP: true,
            cspPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
          },
          storage: {
            ...baseConfig.storage,
            engine: 'indexedDB',
            encryption: true,
            compression: true,
            maxSize: 500,
            persistentCache: true
          },
          api: {
            ...baseConfig.api,
            enableRateLimiting: true,
            requestTimeout: 5000,
            retryAttempts: 3,
            enableRequestLogging: false
          },
          cloud: {
            ...baseConfig.cloud,
            enableCloudSync: true,
            syncStrategy: 'real-time',
            enableBackup: true,
            backupFrequency: 1800000, // 30 minutes
            enableMultiCloud: true
          },
          monitoring: {
            ...baseConfig.monitoring,
            enableAnalytics: true,
            enableErrorTracking: true,
            enablePerformanceMonitoring: true,
            enableUserTracking: true,
            sampleRate: 0.1 // Sample 10% in production
          }
        };
        
      default:
        return baseConfig;
    }
  }
  
  // Public API methods
  
  /**
   * Get current environment
   */
  getEnvironment(): BrolostackEnvironment {
    return this.currentEnvironment;
  }
  
  /**
   * Get environment configuration
   */
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }
  
  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.currentEnvironment === 'development';
  }
  
  /**
   * Check if running in testing
   */
  isTesting(): boolean {
    return this.currentEnvironment === 'testing';
  }
  
  /**
   * Check if running in staging
   */
  isStaging(): boolean {
    return this.currentEnvironment === 'staging';
  }
  
  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.currentEnvironment === 'production';
  }
  
  /**
   * Switch environment (for testing purposes)
   */
  switchEnvironment(env: BrolostackEnvironment): void {
    this.currentEnvironment = env;
    this.config = this.createEnvironmentConfig(env);
    this.logger = new Logger(this.isDevelopment(), 'EnvironmentManager');
    
    this.logger.info(`Environment switched to: ${env}`, {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Apply environment configuration to Brolostack config
   */
  applyToConfig(brolostackConfig: BrolostackConfig): BrolostackConfig {
    const envConfig = this.getConfig();
    
    return {
      ...brolostackConfig,
      debug: envConfig.debug,
      storageEngine: envConfig.storage.engine,
      encryption: envConfig.storage.encryption,
      compression: envConfig.storage.compression,
      maxStorageSize: envConfig.storage.maxSize,
      
      // Apply enterprise configurations based on environment
      enterprise: {
        ...brolostackConfig.enterprise,
        
        // Security configurations
        security: {
          ...brolostackConfig.enterprise?.security,
          enabled: envConfig.security.enableCSP || envConfig.security.enableCORS,
          encryption: {
            enabled: envConfig.storage.encryption,
            algorithm: envConfig.storage.encryption ? 'AES-GCM' : undefined
          }
        },
        
        // Cloud configurations
        cloud: {
          ...brolostackConfig.enterprise?.cloud,
          enabled: envConfig.cloud.enableCloudSync,
          syncStrategy: envConfig.cloud.syncStrategy,
          backup: {
            enabled: envConfig.cloud.enableBackup,
            frequency: envConfig.cloud.backupFrequency
          }
        },
        
        // Worker configurations
        worker: {
          ...brolostackConfig.enterprise?.worker,
          enabled: envConfig.performance.bundleOptimization,
          security: {
            encryption: {
              enabled: envConfig.storage.encryption
            }
          }
        }
      }
    };
  }
  
  /**
   * Get performance optimizations for current environment
   */
  getPerformanceOptimizations(): {
    shouldMinify: boolean;
    shouldCompress: boolean;
    shouldTreeShake: boolean;
    shouldCache: boolean;
    cacheStrategy: string;
    shouldLazyLoad: boolean;
  } {
    const perf = this.config.performance;
    return {
      shouldMinify: perf.enableMinification,
      shouldCompress: perf.enableCompression,
      shouldTreeShake: perf.enableTreeShaking,
      shouldCache: perf.enableCaching,
      cacheStrategy: perf.cacheStrategy,
      shouldLazyLoad: perf.lazyLoading
    };
  }
  
  /**
   * Get security configurations for current environment
   */
  getSecurityConfig(): {
    showDetailedErrors: boolean;
    showStackTraces: boolean;
    enableConsoleLogging: boolean;
    enableSourceMaps: boolean;
    corsConfig: { enabled: boolean; origins: string[] | '*' };
    cspConfig: { enabled: boolean; policy: string };
  } {
    const sec = this.config.security;
    return {
      showDetailedErrors: sec.enableDetailedErrors,
      showStackTraces: sec.enableStackTraces,
      enableConsoleLogging: sec.enableConsoleLogging,
      enableSourceMaps: sec.enableSourceMaps,
      corsConfig: {
        enabled: sec.enableCORS,
        origins: sec.corsOrigins
      },
      cspConfig: {
        enabled: sec.enableCSP,
        policy: sec.cspPolicy
      }
    };
  }
  
  /**
   * Log environment-aware message
   */
  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.config.security.enableConsoleLogging && !this.isDevelopment()) {
      return; // Suppress logs in production unless explicitly enabled
    }
    
    switch (level) {
      case 'info':
        this.logger.info(message, data);
        break;
      case 'warn':
        this.logger.warn(message, data);
        break;
      case 'error':
        this.logger.error(message, data);
        break;
    }
  }
  
  /**
   * Handle environment-specific error reporting
   */
  handleError(error: Error, context?: any): void {
    const secConfig = this.getSecurityConfig();
    
    if (secConfig.showDetailedErrors) {
      this.logger.error('Detailed error information:', {
        error: error.message,
        stack: secConfig.showStackTraces ? error.stack : undefined,
        context,
        environment: this.currentEnvironment,
        timestamp: new Date().toISOString()
      });
    } else {
      // In production, log generic error without sensitive details
      this.logger.error('An error occurred', {
        errorId: this.generateErrorId(),
        timestamp: new Date().toISOString()
      });
    }
    
    // Send to error tracking service if enabled
    if (this.config.monitoring.enableErrorTracking) {
      this.sendToErrorTracking(error, context);
    }
  }
  
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private sendToErrorTracking(error: Error, context?: any): void {
    // Implement error tracking service integration
    // This would integrate with services like Sentry, Bugsnag, etc.
    this.logger.info('Error sent to tracking service', {
      error: error.message,
      context,
      environment: this.currentEnvironment
    });
  }
}

// Global environment manager instance
export const environmentManager = new EnvironmentManager();

// Export environment utilities
export const Environment = {
  current: () => environmentManager.getEnvironment(),
  isDev: () => environmentManager.isDevelopment(),
  isTest: () => environmentManager.isTesting(),
  isStaging: () => environmentManager.isStaging(),
  isProd: () => environmentManager.isProduction(),
  config: () => environmentManager.getConfig(),
  log: (level: 'info' | 'warn' | 'error', message: string, data?: any) => 
    environmentManager.log(level, message, data),
  handleError: (error: Error, context?: any) => 
    environmentManager.handleError(error, context)
};
