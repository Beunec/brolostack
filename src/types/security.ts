/**
 * Brolostack Security Module
 * Core security utilities and types for client-side and AI application security
 * Provides enterprise-grade security for regular Brolostack framework users
 */

// ============================================================================
// SECURITY CONFIGURATION TYPES
// ============================================================================

export interface BrolostackSecurityConfig {
  // Client-side security settings
  clientSide: {
    dataEncryption: {
      enabled: boolean;
      algorithm: 'AES-GCM' | 'ChaCha20-Poly1305';
      keySize: 128 | 192 | 256;
      autoEncryptSensitiveData: boolean;
      sensitiveDataPatterns: string[]; // Regex patterns for auto-detection
    };
    storageProtection: {
      encryptLocalStorage: boolean;
      encryptSessionStorage: boolean;
      encryptIndexedDB: boolean;
      storageQuota: number; // Max storage size in bytes
      dataRetention: number; // Days to retain data
    };
    inputValidation: {
      enabled: boolean;
      sanitizeHTML: boolean;
      validateEmails: boolean;
      validatePhoneNumbers: boolean;
      customValidators: Record<string, (value: any) => boolean>;
    };
    csrfProtection: {
      enabled: boolean;
      tokenName: string;
      headerName: string;
      cookieName: string;
    };
  };

  // AI-specific security settings
  aiSecurity: {
    promptSanitization: {
      enabled: boolean;
      blockMaliciousPrompts: boolean;
      maxPromptLength: number;
      bannedKeywords: string[];
      allowedDomains: string[];
    };
    responseFiltering: {
      enabled: boolean;
      blockSensitiveInfo: boolean;
      contentModerationLevel: 'low' | 'medium' | 'high' | 'strict';
      customFilters: Array<{
        name: string;
        pattern: string;
        action: 'block' | 'warn' | 'sanitize';
      }>;
    };
    rateLimiting: {
      enabled: boolean;
      maxRequestsPerMinute: number;
      maxRequestsPerHour: number;
      maxRequestsPerDay: number;
      blockOnExceed: boolean;
    };
    auditLogging: {
      enabled: boolean;
      logPrompts: boolean;
      logResponses: boolean;
      logUserActions: boolean;
      retentionPeriod: number; // Days
    };
  };

  // Authentication and authorization
  authentication: {
    required: boolean;
    methods: Array<'password' | 'biometric' | 'oauth' | 'sso' | 'magic-link'>;
    sessionManagement: {
      timeout: number; // Minutes
      maxConcurrentSessions: number;
      renewOnActivity: boolean;
    };
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      preventCommonPasswords: boolean;
      preventReuse: number; // Number of previous passwords to check
    };
  };

  // Privacy and compliance
  privacy: {
    dataMinimization: boolean;
    consentManagement: {
      enabled: boolean;
      requiredConsents: string[];
      consentExpiry: number; // Days
    };
    dataSubjectRights: {
      enableDataExport: boolean;
      enableDataDeletion: boolean;
      enableDataPortability: boolean;
    };
    complianceFrameworks: Array<'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD'>;
  };

  // Security monitoring
  monitoring: {
    threatDetection: {
      enabled: boolean;
      detectBruteForce: boolean;
      detectAnomalousActivity: boolean;
      detectDataExfiltration: boolean;
    };
    alerting: {
      enabled: boolean;
      alertThreshold: 'low' | 'medium' | 'high' | 'critical';
      notificationChannels: string[];
    };
    reporting: {
      enabled: boolean;
      generateDailyReports: boolean;
      generateWeeklyReports: boolean;
      generateMonthlyReports: boolean;
    };
  };
}

// ============================================================================
// SECURITY EVENT TYPES
// ============================================================================

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'client' | 'ai' | 'auth' | 'storage' | 'network';
  userId?: string;
  sessionId?: string;
  details: {
    description: string;
    metadata: Record<string, any>;
    stackTrace?: string;
    userAgent?: string;
    ipAddress?: string;
    geolocation?: {
      country: string;
      region: string;
      city: string;
    };
  };
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type SecurityEventType = 
  | 'unauthorized_access'
  | 'brute_force_attempt'
  | 'malicious_prompt'
  | 'data_exfiltration'
  | 'injection_attempt'
  | 'anomalous_activity'
  | 'privacy_violation'
  | 'compliance_breach'
  | 'encryption_failure'
  | 'authentication_failure'
  | 'authentication_success'
  | 'session_hijack'
  | 'csrf_attack'
  | 'xss_attempt'
  | 'rate_limit_exceeded'
  | 'suspicious_ai_usage'
  | 'data_access'
  | 'data_subject_request'
  | 'session_revoked'
  | 'encryption_success'
  | 'validation_failed'
  | 'validation_passed'
  | 'prompt_analyzed'
  | 'malicious_prompt';

// ============================================================================
// ENCRYPTION AND CRYPTOGRAPHY TYPES
// ============================================================================

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  authTag?: string;
  keyId: string;
  algorithm: string;
  timestamp: Date;
}

export interface DecryptionRequest {
  encryptedData: string;
  iv: string;
  authTag?: string;
  keyId: string;
  algorithm: string;
}

export interface CryptoKey {
  id: string;
  algorithm: string;
  keySize: number;
  purpose: 'encryption' | 'signing' | 'key-derivation';
  createdAt: Date;
  expiresAt?: Date;
  rotationCount: number;
  metadata: {
    userId?: string;
    applicationId?: string;
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  };
}

// ============================================================================
// VALIDATION AND SANITIZATION TYPES
// ============================================================================

export interface ValidationRule {
  name: string;
  pattern?: string | RegExp;
  validator?: (value: any) => boolean;
  message: string;
  required?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  removeScripts: boolean;
  removeStyles: boolean;
  removeComments: boolean;
  encodeEntities: boolean;
}

// ============================================================================
// AI SECURITY TYPES
// ============================================================================

export interface AIPromptAnalysis {
  safe: boolean;
  riskScore: number; // 0-100
  detectedThreats: Array<{
    type: 'injection' | 'malicious_code' | 'data_extraction' | 'social_engineering' | 'inappropriate_content';
    confidence: number; // 0-1
    description: string;
    recommendation: string;
  }>;
  sanitizedPrompt?: string;
  metadata: {
    originalLength: number;
    sanitizedLength?: number;
    processingTime: number;
    modelUsed: string;
  };
}

export interface AIResponseAnalysis {
  safe: boolean;
  riskScore: number;
  detectedIssues: Array<{
    type: 'sensitive_info' | 'harmful_content' | 'misinformation' | 'privacy_violation' | 'bias';
    confidence: number;
    description: string;
    recommendation: string;
  }>;
  filteredResponse?: string;
  metadata: {
    originalLength: number;
    filteredLength?: number;
    processingTime: number;
    contentModerationLevel: string;
  };
}

export interface AIUsageMetrics {
  userId: string;
  sessionId: string;
  totalRequests: number;
  requestsInLastMinute: number;
  requestsInLastHour: number;
  requestsInLastDay: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  riskScore: number;
  flaggedRequests: number;
  lastActivity: Date;
}

// ============================================================================
// AUTHENTICATION AND SESSION TYPES
// ============================================================================

export interface AuthenticationResult {
  success: boolean;
  userId?: string;
  sessionId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  permissions?: string[];
  roles?: string[];
  metadata?: {
    loginMethod: string;
    deviceId: string;
    ipAddress: string;
    userAgent: string;
    geolocation?: {
      country: string;
      region: string;
      city: string;
    };
  };
  securityFlags?: {
    requirePasswordChange: boolean;
    requireMFA: boolean;
    suspiciousActivity: boolean;
    newDevice: boolean;
  };
}

export interface SessionInfo {
  id: string;
  userId: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  deviceId: string;
  active: boolean;
  permissions: string[];
  roles: string[];
  securityLevel: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
}

// ============================================================================
// PRIVACY AND COMPLIANCE TYPES
// ============================================================================

export interface ConsentRecord {
  userId: string;
  consentType: string;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  version: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    method: 'explicit' | 'implicit' | 'pre_checked';
  };
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  description: string;
  legalBasis?: string;
  processingDetails?: string;
  responseData?: any;
}

export interface ComplianceReport {
  id: string;
  framework: 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD';
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalUsers: number;
    totalDataProcessed: number;
    consentRate: number;
    dataSubjectRequests: number;
    securityIncidents: number;
    complianceScore: number; // 0-100
  };
  violations: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedUsers: number;
    remediation: string;
    status: 'open' | 'resolved';
  }>;
  recommendations: string[];
}

// ============================================================================
// SECURITY UTILITY INTERFACES
// ============================================================================

export interface SecurityUtils {
  // Encryption utilities
  encrypt(data: any, options?: Partial<EncryptionOptions>): Promise<EncryptionResult>;
  decrypt(request: DecryptionRequest): Promise<any>;
  generateKey(purpose: 'encryption' | 'signing', options?: Partial<KeyGenerationOptions>): Promise<CryptoKey>;
  rotateKey(keyId: string): Promise<CryptoKey>;

  // Validation and sanitization
  validateInput(data: any, rules: ValidationRule[]): ValidationResult;
  sanitizeHTML(html: string, options?: SanitizationOptions): string;
  sanitizeSQL(query: string): string;
  detectXSS(input: string): boolean;
  detectSQLInjection(input: string): boolean;

  // AI security
  analyzePrompt(prompt: string): Promise<AIPromptAnalysis>;
  analyzeResponse(response: string): Promise<AIResponseAnalysis>;
  checkAIUsageLimits(userId: string): Promise<AIUsageMetrics>;
  sanitizePrompt(prompt: string): string;
  filterResponse(response: string): string;

  // Authentication and sessions
  authenticate(credentials: any, method: string): Promise<AuthenticationResult>;
  createSession(userId: string, metadata?: any): Promise<SessionInfo>;
  validateSession(sessionId: string): Promise<SessionInfo | null>;
  revokeSession(sessionId: string): Promise<boolean>;
  renewSession(sessionId: string): Promise<SessionInfo>;

  // Privacy and compliance
  recordConsent(userId: string, consentType: string, granted: boolean): Promise<ConsentRecord>;
  checkConsent(userId: string, consentType: string): Promise<ConsentRecord | null>;
  processDataSubjectRequest(request: Omit<DataSubjectRequest, 'id' | 'requestedAt'>): Promise<DataSubjectRequest>;
  generateComplianceReport(framework: string, startDate: Date, endDate: Date): Promise<ComplianceReport>;

  // Security monitoring
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<SecurityEvent>;
  getSecurityEvents(filters?: any): Promise<SecurityEvent[]>;
  analyzeSecurityTrends(): Promise<any>;
  generateSecurityReport(period: { start: Date; end: Date }): Promise<any>;

  // Threat detection
  detectBruteForce(userId: string, ipAddress: string): Promise<boolean>;
  detectAnomalousActivity(userId: string, activity: any): Promise<boolean>;
  detectDataExfiltration(userId: string, dataAccess: any): Promise<boolean>;
  calculateRiskScore(userId: string, context: any): Promise<number>;

  // Secure storage
  secureStore(key: string, value: any, options?: SecureStorageOptions): Promise<boolean>;
  secureRetrieve(key: string, options?: SecureStorageOptions): Promise<any>;
  secureDelete(key: string, options?: SecureStorageOptions): Promise<boolean>;
  clearSecureStorage(): Promise<boolean>;
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface EncryptionOptions {
  algorithm: 'AES-GCM' | 'ChaCha20-Poly1305';
  keySize: 128 | 192 | 256;
  keyId?: string;
  associatedData?: string;
}

export interface KeyGenerationOptions {
  algorithm: string;
  keySize: number;
  extractable: boolean;
  keyUsages: string[];
  expiresIn?: number; // Milliseconds
}

export interface SecureStorageOptions {
  encrypt: boolean;
  compress: boolean;
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
  backup?: boolean;
}

// ============================================================================
// SECURITY PATTERNS AND CONSTANTS
// ============================================================================

export const SENSITIVE_DATA_PATTERNS = {
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE: /(\+?1-?)?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  SSN: /\b(?:\d{3}-\d{2}-\d{4}|\d{9})\b/g,
  CREDIT_CARD: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g,
  API_KEY: /\b[A-Za-z0-9]{32,}\b/g,
  PASSWORD: /password["\s]*[:=]["\s]*[^\s"]+/gi,
  JWT_TOKEN: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
  IP_ADDRESS: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
};

export const MALICIOUS_PATTERNS = {
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(\bOR\s+\d+\s*=\s*\d+\b)/gi,
    /(\bAND\s+\d+\s*=\s*\d+\b)/gi,
    /('|\"|;|--|\*|\/\*|\*\/)/g
  ],
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
  ],
  COMMAND_INJECTION: [
    /(\||&|;|\$\(|\`)/g,
    /\b(rm|del|format|shutdown|reboot|kill|wget|curl)\b/gi
  ],
  AI_PROMPT_INJECTION: [
    /ignore\s+(previous|all|above|system)\s+(instructions?|prompts?|rules?)/gi,
    /forget\s+(everything|all|previous)/gi,
    /act\s+as\s+(a\s+)?(different|another|new)\s+(ai|bot|assistant)/gi,
    /pretend\s+(to\s+be|you\s+are)/gi,
    /(roleplay|role\s+play)\s+as/gi,
    /system\s*:\s*you\s+are\s+now/gi
  ]
};

export const SECURITY_HEADERS = {
  CSP: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' https:; object-src 'none'; media-src 'self'; frame-src 'none';",
  HSTS: "max-age=31536000; includeSubDomains; preload",
  X_FRAME_OPTIONS: "DENY",
  X_CONTENT_TYPE_OPTIONS: "nosniff",
  X_XSS_PROTECTION: "1; mode=block",
  REFERRER_POLICY: "strict-origin-when-cross-origin",
  PERMISSIONS_POLICY: "geolocation=(), microphone=(), camera=()"
};

export const COMPLIANCE_REQUIREMENTS = {
  GDPR: {
    dataRetentionMaxDays: 2555, // 7 years
    consentExpiryDays: 365,
    dataSubjectRequestResponseDays: 30,
    breachNotificationHours: 72,
    requiredConsents: ['functional', 'analytics', 'marketing'],
    dataProcessingLegalBases: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']
  },
  CCPA: {
    dataRetentionMaxDays: 1095, // 3 years
    consentExpiryDays: 365,
    dataSubjectRequestResponseDays: 45,
    requiredDisclosures: ['data_collection', 'data_use', 'data_sharing', 'data_retention'],
    consumerRights: ['know', 'delete', 'opt_out', 'non_discrimination']
  },
  HIPAA: {
    dataRetentionMinYears: 6,
    auditLogRetentionYears: 6,
    encryptionRequired: true,
    accessLogRequired: true,
    breachNotificationDays: 60,
    businessAssociateAgreementRequired: true
  },
  PCI_DSS: {
    encryptionRequired: true,
    keyRotationDays: 365,
    accessLogRetentionMonths: 12,
    vulnerabilityTestingRequired: true,
    networkSegmentationRequired: true,
    strongCryptographyRequired: true
  }
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class ValidationError extends SecurityError {
  constructor(message: string, public field: string, public value: any) {
    super(message, 'VALIDATION_ERROR', 'medium', { field, value });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends SecurityError {
  constructor(message: string, public reason: string) {
    super(message, 'AUTHENTICATION_ERROR', 'high', { reason });
    this.name = 'AuthenticationError';
  }
}

export class EncryptionError extends SecurityError {
  constructor(message: string, public operation: string) {
    super(message, 'ENCRYPTION_ERROR', 'critical', { operation });
    this.name = 'EncryptionError';
  }
}

export class ComplianceError extends SecurityError {
  constructor(message: string, public framework: string, public violation: string) {
    super(message, 'COMPLIANCE_ERROR', 'high', { framework, violation });
    this.name = 'ComplianceError';
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
export type ComplianceFramework = 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD' | 'HIPAA' | 'PCI_DSS' | 'SOC2' | 'ISO27001';
export type AuthenticationMethod = 'password' | 'biometric' | 'oauth' | 'sso' | 'magic-link' | 'mfa';
export type EncryptionAlgorithm = 'AES-GCM' | 'ChaCha20-Poly1305' | 'AES-CBC' | 'RSA-OAEP';
export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'bcrypt' | 'scrypt' | 'argon2';

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// Removed self-referencing export to fix circular dependency
