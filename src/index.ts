/**
 * Brolostack - Main Entry Point
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 */

// Core exports
export { Brolostack } from './core/Brolostack';

// Enhanced exports (optional features)
export { EnhancedBrolostack } from './core/EnhancedBrolostack';

// Environment Management (v1.0.2)
export { 
  EnvironmentManager, 
  environmentManager, 
  Environment 
} from './core/EnvironmentManager';
export { default as EnvironmentUtils } from './utils/EnvironmentUtils';
export { SyncManager } from './sync/SyncManager';
export { EnhancedStorageAdapter } from './storage/EnhancedStorageAdapter';

// Cloud integration exports (optional features)
export { CloudBrolostack } from './cloud/CloudBrolostack';
export { CloudSyncManager } from './cloud/CloudSyncManager';
export * from './cloud/types';

// New SQL Database Adapters (v1.0.2)
export { PostgreSQLAdapter } from './cloud/adapters/PostgreSQLAdapter';
export { SupabaseAdapter } from './cloud/adapters/SupabaseAdapter';

// Browser compatibility exports
export { BrowserCompatibility, browserCompatibility } from './utils/BrowserCompatibility';
export { BrowserCompatibleSyncManager } from './sync/BrowserCompatibleSyncManager';
export { BrowserCompatibleStorageAdapter } from './storage/BrowserCompatibleStorageAdapter';

// Private mode exports
export { PrivateModeManager, privateModeManager } from './utils/PrivateModeManager';
export { PrivateModeStorageAdapter } from './storage/PrivateModeStorageAdapter';

// Type exports
export * from './types';

// Storage exports
export { LocalStorageAdapter } from './storage/LocalStorageAdapter';

// API exports
export { LocalAPI } from './api/LocalAPI';

// AI exports
export { AIManager } from './ai/AIManager';

// Utility exports
export { EventEmitter } from './utils/EventEmitter';
export { Logger, LogLevel } from './utils/Logger';

// Real-time Communication (v1.0.2)
export { WebSocketManager } from './realtime/WebSocketManager';

// Revolutionary WebSocket Framework (v1.0.2)
export { BrolostackWSMultiagent } from './realtime/BrolostackWSMultiagent';
export { BrolostackWSClientside, useBrolostackWebSocket } from './realtime/BrolostackWSClientside';

// ARGS Protocol (v1.0.2)
export { 
  ARGSProtocolHandler,
  ARGS_VERSION,
  ARGS_PROTOCOL_NAME,
  DEFAULT_ARGS_CONFIG
} from './realtime/protocols/ARGSProtocol';

// Backend Integrations (v1.0.2)
export { 
  BrolostackNodeJSIntegration,
  ExpressWebSocketSetup,
  NestJSWebSocketSetup,
  FastifyWebSocketSetup
} from './realtime/integrations/NodeJSIntegration';
export { 
  BrolostackPythonIntegration,
  PythonClientIntegration 
} from './realtime/integrations/PythonIntegration';

// Enhanced Real-time Types (v1.0.2)
export * from './types/realtime';

// 🔥 BROLOSTACK DEVIL SECURITY FRAMEWORK 🔥 (v1.0.2)
export {
  BrolostackDevil,
  getBrolostackDevil,
  Devil,
  DevilSecurityLevel,
  DevilEncryptionAlgorithm
} from './security/BrolostackDevil';

export type {
  BrolostackDevilConfig,
  DevilBlockchainToken,
  DevilEncryptionResult
} from './security/BrolostackDevil';

// 🔥 BROLOSTACK DEVIL SOURCE CODE PROTECTION 🔥 (v1.0.2)
export {
  BrolostackDevilSourceCode,
  getBrolostackDevilSourceCode,
  DevilSourceCode
} from './security/BrolostackDevilSourceCode';

export type {
  BrolostackDevilSourceCodeConfig,
  DevilObfuscationResult
} from './security/BrolostackDevilSourceCode';

// 🔥 BROLOSTACK DEVIL BUILD PLUGINS 🔥 (v1.0.2)
export {
  BrolostackDevilWebpackPlugin,
  brolostackDevilVitePlugin,
  brolostackDevilRollupPlugin,
  BrolostackDevilParcelPlugin,
  brolostackDevilNextPlugin,
  createReactAppDevil,
  brolostackDevilBabelPlugin,
  DevilCLI
} from './build/DevilBuildPlugin';

export type {
  DevilBuildPluginOptions
} from './build/DevilBuildPlugin';

// 🔥 BROLOSTACK DEVIL REACT INTEGRATION 🔥 (v1.0.2)
export {
  BrolostackDevilProvider,
  useBrolostackDevil,
  useDevilProtectedState,
  useDevilProtectedAI,
  useDevilCloudProtection,
  useDevilMonitoring
} from './react/BrolostackDevilProvider';

export type {
  BrolostackDevilProviderProps
} from './react/BrolostackDevilProvider';

// 🤖 BROLOSTACK AI GOVERNANCE FRAMEWORK 🤖 (v1.0.2)
export {
  BrolostackBSDGF4AI,
  getBrolostackBSDGF4AI,
  AIGovernance,
  TokenUsageManager
} from './ai/governance/BrolostackBSDGF4AI';

export type {
  BSDGFConfig,
  BSDGFAssessmentResult,
  GovernedAIResponse,
  TokenUsageConfig,
  TokenUsageMetrics,
  TokenControlResult
} from './ai/governance/BrolostackBSDGF4AI';

// 🧠 BROLOSTACK AI REASONING FRAMEWORKS 🧠 (v1.0.2)
export {
  BrolostackReAcT
} from './ai/argprotocol/BrolostackReAcT';

export {
  BrolostackCoT
} from './ai/argprotocol/BrolostackCoT';

export {
  BrolostackToT
} from './ai/argprotocol/BrolostackToT';

export {
  BrolostackCoTSC
} from './ai/argprotocol/BrolostackCoTSC';

export type {
  ReActConfig,
  ReActResult
} from './ai/argprotocol/BrolostackReAcT';

export type {
  CoTConfig,
  CoTResult
} from './ai/argprotocol/BrolostackCoT';

export type {
  ToTConfig,
  ToTResult
} from './ai/argprotocol/BrolostackToT';

export type {
  CoTSCConfig,
  CoTSCResult
} from './ai/argprotocol/BrolostackCoTSC';

// 🤖 BROLOSTACK AI FRAMEWORK 🤖 (v1.0.2)
export {
  BrolostackAIFramework,
  getBrolostackAI,
  BrolostackAI
} from './ai/BrolostackAIFramework';

export type {
  BrolostackAIConfig,
  AIExecutionResult
} from './ai/BrolostackAIFramework';

// 🤖 BROLOSTACK AI REACT INTEGRATION 🤖 (v1.0.2)
export {
  BrolostackAIProvider,
  useBrolostackAI,
  useAIConversation,
  useAIStreaming,
  useAIGovernance,
  useReasoningFramework
} from './react/BrolostackAIProvider';

export type {
  BrolostackAIProviderProps
} from './react/BrolostackAIProvider';

// 💰 BROLOSTACK TOKEN USAGE CONTROL 💰 (v1.0.2)
export {
  useTokenUsage,
  TokenUsageDisplay,
  TokenUsageGuard
} from './react/useTokenUsage';

// 🔐 ENTERPRISE AUTHENTICATION & AUTHORIZATION WITH CIAM 🔐 (v1.0.2)
export { AuthManager } from './auth/AuthManager';

export type {
  AuthConfig,
  AuthSession,
  User,
  Role,
  Permission,
  AuthToken,
  LoginCredentials,
  CIAMProviderConfig,
  CloudAuthConfig,
  HybridAuthConfig,
  CIAMProvider,
  CloudAuthProvider
} from './auth/AuthManager';

// 🔐 BROLOSTACK CIAM REACT INTEGRATION 🔐 (v1.0.2)
export {
  BrolostackCIAMProvider,
  useBrolostackCIAM,
  useAuth,
  usePermissions,
  useSocialAuth,
  usePasswordlessAuth,
  useBiometricAuth,
  useMFA,
  useProviderManagement,
  ProtectedRoute
} from './react/BrolostackCIAMProvider';

export type {
  BrolostackCIAMProviderProps
} from './react/BrolostackCIAMProvider';

// Multi-Rendering Mode Manager - SSR, SSG & Hybrid (v1.0.2)
export { BrolostackMRMManager } from './mrm/BrolostackMRMManager';

// Backend Framework Adapters (v1.0.2)
// Python Framework Adapters (v1.0.2)
export { FastAPIAdapter } from './backend/python/FastAPIAdapter';
export { FlaskAdapter } from './backend/python/FlaskAdapter';

// AI Framework Adapters (v1.0.2)
export { AutoGenAdapter } from './backend/ai/AutoGenAdapter';
export { CrewAIAdapter } from './backend/ai/CrewAIAdapter';
export { LangChainAdapter } from './backend/ai/LangChainAdapter';
export { LangGraphAdapter } from './backend/ai/LangGraphAdapter';

// Node.js Framework Adapters (v1.0.2)
export { ExpressAdapter } from './backend/nodejs/ExpressAdapter';
export { NestJSAdapter } from './backend/nodejs/NestJSAdapter';

// Provider Factories and Management (v1.0.2)
export { AIProviderFactory } from './ai/providers/AIProviderFactory';
export * from './ai/providers/AIProviderTypes';
export { CloudProviderFactory } from './cloud/providers/CloudProviderFactory';
export { EnterpriseProviderManager } from './providers/EnterpriseProviderManager';

// Specialized Cloud Adapters (v1.0.2)
export { RedisCloudAdapter } from './cloud/providers/RedisCloudAdapter';
export { MongoDBAtlasAdapter } from './cloud/providers/MongoDBAtlasAdapter';

// Enterprise Cloud Adapters (v1.0.2)
export { 
  IBMCloudAdapter, 
  OracleCloudAdapter, 
  SalesforceCloudAdapter, 
  SAPCloudAdapter, 
  DigitalOceanAdapter 
} from './cloud/providers/EnterpriseCloudAdapters';

// Modern Cloud Adapters (v1.0.2)
export { 
  TencentCloudAdapter, 
  VMwareCloudAdapter, 
  CloudflareAdapter, 
  CoreWeaveAdapter, 
  HuaweiCloudAdapter 
} from './cloud/providers/ModernCloudAdapters';

// Specialized Cloud Adapters (v1.0.2)
export { 
  RackspaceAdapter, 
  CiscoCloudAdapter, 
  NetAppCloudAdapter, 
  DellCloudAdapter, 
  CohesityAdapter, 
  BroadcomAdapter 
} from './cloud/providers/SpecializedCloudAdapters';

// Database Adapters (v1.0.2)
export { MySQLAdapter } from './cloud/adapters/MySQLAdapter';
export { SQLAdapter } from './cloud/adapters/SQLAdapter';
export { NoSQLAdapter } from './cloud/adapters/NoSQLAdapter';

// Additional AI Provider Implementations (v1.0.2)
export { 
  PerplexityAdapter,
  IBMWatsonAdapter,
  MiniMaxAdapter,
  DatabricksAdapter,
  XAIAdapter,
  ClarifaiAdapter,
  TogetherAIAdapter,
  NLPCloudAdapter,
  AIMAPIAdapter
} from './ai/providers/AllAIProviders';

// Brolostack Worker - Enterprise Background Processing (v1.0.2)
export { BrolostackWorker } from './worker/BrolostackWorker';
export { SecurityManager } from './worker/SecurityManager';
export { CRUDManager } from './worker/CRUDManager';
export { ApplicationTemplates } from './worker/ApplicationTemplates';

// Brolostack Security - Core Security Framework (v1.0.2)
export { BrolostackSecurity } from './security/BrolostackSecurity';
export { SecurityAuditor, getSecurityAuditor, SecurityAudit } from './security/SecurityAuditor';
export * from './types/security';

// Export Console Module
export { 
  BrolostackConsole, 
  getBrolostackConsole, 
  initializeBrolostackConsole,
  BrolostackConsoleUtils 
} from './console/BrolostackConsole';
export { ConsoleEventManager } from './console/ConsoleEvents';
export { ConsoleUtils } from './console/ConsoleUtils';
export { SecretsManager, ConsolePlatformIntegration } from './console/SecretsManager';
export { FrameworkIntegrationCheck, checkConsoleIntegration } from './console/FrameworkIntegrationCheck';
export * from './console/ConsoleTypes';
export * from './console/ConsoleEnums';

// React integration (if React is available)
export { BrolostackProvider, useBrolostack, useBrolostackStore } from './react/BrolostackProvider';

// Default export
import { Brolostack } from './core/Brolostack';
export { Brolostack as default };
