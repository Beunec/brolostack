/**
 * Cloud Integration Types
 * Defines interfaces for cloud service integrations
 */

export interface CloudAdapter {
  name: string;
  provider: string;
  
  // Connection management
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Data operations
  sync(data: any): Promise<void>;
  backup(data: any): Promise<void>;
  restore(): Promise<any>;
  
  // Store-specific operations
  syncStore(storeName: string, data: any): Promise<void>;
  restoreStore(storeName: string): Promise<any>;
  
  // Health and status
  getStatus(): CloudAdapterStatus;
  getCapabilities(): CloudAdapterCapabilities;
}

export interface CloudAdapterStatus {
  connected: boolean;
  lastSync?: Date;
  lastBackup?: Date;
  errorCount: number;
  lastError?: string | undefined;
}

export interface CloudAdapterCapabilities {
  supportsSync: boolean;
  supportsBackup: boolean;
  supportsRestore: boolean;
  supportsRealTime: boolean;
  maxDataSize?: number;
  supportedFormats: string[];
}

export interface CloudProviderCapabilities {
  storage: {
    objectStorage: boolean;
    blockStorage: boolean;
    fileStorage: boolean;
    cdn: boolean;
    backup: boolean;
  };
  database: {
    relational: boolean;
    nosql: boolean;
    cache: boolean;
    search: boolean;
    analytics: boolean;
  };
  compute: {
    serverless: boolean;
    containers: boolean;
    virtualMachines: boolean;
    kubernetes: boolean;
    gpu: boolean;
    edge: boolean;
  };
  ai: {
    machineLearning: boolean;
    naturalLanguage: boolean;
    computerVision: boolean;
    speechRecognition: boolean;
    recommendation: boolean;
  };
  networking: {
    loadBalancer: boolean;
    cdn: boolean;
    dns: boolean;
    vpn: boolean;
    firewall: boolean;
  };
  security: {
    encryption: boolean;
    iam: boolean;
    compliance: string[];
    audit: boolean;
    backup: boolean;
  };
}

export interface CloudSyncManager {
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
  
  // Store operations
  syncStore(storeName: string, data: any): Promise<void>;
  restoreStore(storeName: string): Promise<any>;
  
  // Bulk operations
  syncAllStores(): Promise<void>;
  restoreAllStores(): Promise<void>;
  
  // Backup operations
  createBackup(): Promise<void>;
  restoreBackup(backupId: string): Promise<void>;
  listBackups(): Promise<CloudBackup[]>;
  
  // Conflict resolution
  resolveConflict(storeName: string, localData: any, cloudData: any): Promise<any>;
}

export interface CloudBackup {
  id: string;
  timestamp: Date;
  size: number;
  stores: string[];
  checksum: string;
}

export interface CloudSyncEvent {
  type: 'sync-started' | 'sync-completed' | 'sync-failed' | 'conflict-detected';
  storeName?: string;
  data?: any;
  error?: Error;
  timestamp: Date;
}

// Cloud provider specific configurations
export interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName?: string;
  tableName?: string;
}

export interface GoogleCloudConfig {
  projectId: string;
  serviceAccountKey: string;
  bucketName?: string;
  collectionName?: string;
}

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  databaseId?: string;
  bucketName?: string;
}

export interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
  collectionName?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// New Provider Configurations (v1.0.2)
export interface DigitalOceanConfig {
  token: string;
  region: string;
  spacesAccessKey?: string;
  spacesSecretKey?: string;
  spacesEndpoint?: string;
}

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  zoneId?: string;
  workersKV?: {
    namespaceId: string;
  };
  r2?: {
    bucketName: string;
  };
  d1?: {
    databaseId: string;
  };
}

export interface AlibabaCloudConfig {
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  endpoint?: string;
  securityToken?: string;
}

export interface IBMCloudConfig {
  apiKey: string;
  region: string;
  serviceInstanceId?: string;
  iamUrl?: string;
  endpoint?: string;
}

export interface OracleCloudConfig {
  tenancy: string;
  user: string;
  fingerprint: string;
  privateKey: string;
  region: string;
  compartmentId?: string;
}

export interface SalesforceCloudConfig {
  instanceUrl: string;
  accessToken: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  securityToken?: string;
}

export interface TencentCloudConfig {
  secretId: string;
  secretKey: string;
  region: string;
  token?: string;
  endpoint?: string;
}

export interface HuaweiCloudConfig {
  accessKey: string;
  secretKey: string;
  region: string;
  projectId?: string;
  securityToken?: string;
}

// Enterprise Provider Configurations
export interface VMwareCloudConfig {
  refreshToken: string;
  orgId: string;
  sddcId?: string;
  apiUrl?: string;
}

export interface RackspaceConfig {
  username: string;
  apiKey: string;
  region: string;
  authUrl?: string;
  tenantId?: string;
}

export interface NetAppConfig {
  endpoint: string;
  username: string;
  password: string;
  svm?: string;
  certificate?: string;
}

export interface CohesityConfig {
  cluster: string;
  username: string;
  password: string;
  domain?: string;
  port?: number;
  apiVersion?: string;
}

// AI Provider Configurations
export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  baseURL?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface HuggingFaceConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
  task?: 'text-generation' | 'text-classification' | 'question-answering' | 'summarization';
  options?: Record<string, any>;
}

export interface CohereConfig {
  apiKey: string;
  model?: string;
  version?: string;
  endpoint?: string;
}

export interface MistralConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
  safeMode?: boolean;
}

export interface ReplicateConfig {
  apiToken: string;
  model: string;
  version?: string;
  webhook?: string;
}

export interface StabilityAIConfig {
  apiKey: string;
  engine?: string;
  host?: string;
}

export interface PerplexityConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
}

export interface IBMWatsonConfig {
  apiKey: string;
  serviceUrl: string;
  version: string;
  authenticator?: 'iam' | 'basic' | 'bearer';
}

export interface DatabricksConfig {
  host: string;
  token: string;
  clusterId?: string;
  workspaceUrl?: string;
}

export interface TogetherAIConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
}

export interface NLPCloudConfig {
  apiKey: string;
  model: string;
  gpu?: boolean;
  lang?: string;
}

// Multi-Provider Configuration
export interface MultiProviderConfig {
  primary: {
    provider: string;
    config: any;
  };
  fallback?: Array<{
    provider: string;
    config: any;
    priority: number;
  }>;
  loadBalancing?: {
    strategy: 'round-robin' | 'weighted' | 'least-connections' | 'random';
    healthCheck: boolean;
    healthCheckInterval: number;
  };
  failover?: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
    circuitBreaker: boolean;
  };
}

// Enhanced Cloud Adapter Interface
export interface EnhancedCloudAdapter extends CloudAdapter {
  // Multi-region support
  setRegion(region: string): Promise<void>;
  getAvailableRegions(): Promise<string[]>;
  
  // Cost optimization
  getCostEstimate(operation: string, data: any): Promise<number>;
  optimizeForCost(data: any): Promise<any>;
  
  // Performance monitoring
  getPerformanceMetrics(): Promise<{
    latency: number;
    throughput: number;
    errorRate: number;
    availability: number;
  }>;
  
  // Security features
  enableEncryption(keyId?: string): Promise<void>;
  disableEncryption(): Promise<void>;
  rotateKeys(): Promise<void>;
  
  // Compliance
  getComplianceStatus(): Promise<{
    certifications: string[];
    auditLogs: boolean;
    dataResidency: string;
    privacyControls: string[];
  }>;
}

// Provider Selection Strategy
export interface ProviderSelectionStrategy {
  selectProvider(
    availableProviders: string[],
    operation: string,
    data: any,
    context?: Record<string, any>
  ): Promise<string>;
}

export class CostOptimizedStrategy implements ProviderSelectionStrategy {
  async selectProvider(availableProviders: string[], _operation: string, _data: any): Promise<string> {
    // Select the most cost-effective provider for the operation
    // This would involve cost calculations for each provider
    return availableProviders[0] || 'default'; // Placeholder
  }
}

export class PerformanceOptimizedStrategy implements ProviderSelectionStrategy {
  async selectProvider(availableProviders: string[], _operation: string, _data: any): Promise<string> {
    // Select the fastest provider for the operation
    // This would involve latency and throughput analysis
    return availableProviders[0] || 'default'; // Placeholder
  }
}

export class ComplianceOptimizedStrategy implements ProviderSelectionStrategy {
  // private _requiredCompliance: string[]; // Reserved for future compliance checking

  constructor(_requiredCompliance: string[]) {
    // this._requiredCompliance = requiredCompliance; // Reserved for future compliance checking
  }

  async selectProvider(availableProviders: string[], _operation: string, _data: any): Promise<string> {
    // Select provider that meets compliance requirements
    // This would check provider certifications against this.requiredCompliance
    return availableProviders[0] || 'default'; // Placeholder
  }
}
