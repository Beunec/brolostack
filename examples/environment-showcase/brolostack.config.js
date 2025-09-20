/**
 * Brolostack Environment Configuration Example
 * Demonstrates seamless environment switching capabilities
 */

const { EnvironmentUtils } = require('brolostack');

// Base configuration that works across all environments
const baseConfig = {
  appName: 'environment-showcase-app',
  version: '1.0.0',
  
  // Enterprise features
  enterprise: {
    auth: {
      enabled: true,
      provider: 'custom',
      endpoints: {
        login: process.env.AUTH_LOGIN_URL || 'http://localhost:3000/auth/login',
        logout: process.env.AUTH_LOGOUT_URL || 'http://localhost:3000/auth/logout',
        refresh: process.env.AUTH_REFRESH_URL || 'http://localhost:3000/auth/refresh',
        profile: process.env.AUTH_PROFILE_URL || 'http://localhost:3000/auth/profile'
      }
    },
    
    cloud: {
      enabled: true,
      providers: [
        {
          name: 'aws',
          config: {
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
          }
        },
        {
          name: 'azure',
          config: {
            credentials: {
              apiKey: process.env.AZURE_API_KEY
            }
          }
        }
      ],
      defaultProvider: 'aws'
    },
    
    security: {
      enabled: true,
      encryption: {
        // Environment manager will override this based on current environment
        enabled: false // Will be true in staging/production
      }
    }
  }
};

// Create environment-optimized configuration
const config = EnvironmentUtils.createEnvironmentConfig(baseConfig);

// Environment-specific customizations
switch (process.env.NODE_ENV) {
  case 'development':
    // Development-specific overrides
    config.enterprise.cloud.providers = [
      {
        name: 'localstack', // Use LocalStack for local development
        config: {
          endpoint: 'http://localhost:4566',
          credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
          }
        }
      }
    ];
    break;
    
  case 'test':
  case 'testing':
    // Testing-specific overrides
    config.enterprise.cloud.enabled = false; // Disable cloud in tests
    config.enterprise.auth.endpoints = {
      login: 'http://test-auth.local/login',
      logout: 'http://test-auth.local/logout',
      refresh: 'http://test-auth.local/refresh',
      profile: 'http://test-auth.local/profile'
    };
    break;
    
  case 'staging':
    // Staging-specific overrides
    config.enterprise.cloud.providers.push({
      name: 'gcp',
      config: {
        credentials: {
          serviceAccountKey: process.env.GCP_SERVICE_ACCOUNT_KEY
        }
      }
    });
    break;
    
  case 'production':
    // Production-specific overrides
    config.enterprise.security.compliance = {
      gdpr: true,
      hipaa: process.env.HIPAA_COMPLIANCE === 'true',
      sox: process.env.SOX_COMPLIANCE === 'true'
    };
    
    config.enterprise.monitoring = {
      enabled: true,
      errorTracking: {
        service: 'sentry',
        dsn: process.env.SENTRY_DSN
      },
      analytics: {
        service: 'mixpanel',
        token: process.env.MIXPANEL_TOKEN
      }
    };
    break;
}

module.exports = config;
