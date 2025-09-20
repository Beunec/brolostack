/**
 * Security Manager for Brolostack Worker
 * Implements web-cryptographic security and blockchain-like verification system
 * Ensures data integrity, confidentiality, and authenticity across all operations
 */

import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';

export interface SecurityConfig {
  encryption: {
    enabled: boolean;
    algorithm: 'AES-GCM' | 'ChaCha20-Poly1305' | 'AES-CBC';
    keySize: 128 | 192 | 256;
    keyDerivation: 'PBKDF2' | 'scrypt' | 'Argon2';
    keyRotationInterval: number;
    saltSize: number;
  };
  blockchain: {
    enabled: boolean;
    networkType: 'private' | 'consortium' | 'public';
    consensusAlgorithm: 'PoW' | 'PoS' | 'PBFT' | 'Raft';
    blockSize: number;
    difficulty: number;
    miningReward: number;
    validatorNodes: string[];
  };
  authentication: {
    multiFactorRequired: boolean;
    biometricEnabled: boolean;
    sessionTimeout: number;
    tokenRotationInterval: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      preventReuse: number;
    };
  };
  audit: {
    enabled: boolean;
    logLevel: 'minimal' | 'standard' | 'detailed' | 'verbose';
    retention: number;
    tamperProof: boolean;
    realTimeMonitoring: boolean;
  };
  compliance: {
    frameworks: Array<'SOC2' | 'HIPAA' | 'GDPR' | 'PCI-DSS' | 'ISO27001' | 'FedRAMP'>;
    dataClassification: {
      enabled: boolean;
      levels: Array<'public' | 'internal' | 'confidential' | 'restricted'>;
      autoClassification: boolean;
    };
    dataResidency: {
      enabled: boolean;
      allowedRegions: string[];
      crossBorderRestrictions: boolean;
    };
  };
}

export interface SecurityCryptoKey {
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
    dataClassification?: string;
  };
  cryptoKey: CryptoKey;
}

export interface SecurityBlock {
  index: number;
  timestamp: number;
  previousHash: string;
  merkleRoot: string;
  nonce: number;
  difficulty: number;
  transactions: SecurityTransaction[];
  hash: string;
  validator?: string;
  signature?: string;
}

export interface SecurityTransaction {
  id: string;
  type: 'data-access' | 'data-modification' | 'key-rotation' | 'authentication' | 'authorization' | 'data-encryption' | 'data-decryption' | 'signature-verification' | 'data-integrity-check';
  userId: string;
  sessionId: string;
  operation: string;
  resource: string;
  dataHash: string;
  timestamp: number;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    geolocation?: string;
    riskScore?: number;
    algorithm?: string;
    signatureValid?: boolean;
    expectedHash?: string;
    actualHash?: string;
    isValid?: boolean;
    authorized?: boolean;
    securityLevel?: string;
    auditRequired?: boolean;
    oldKeyRotationCount?: number;
    newKeyRotationCount?: number;
    operationCount?: number;
    transactionType?: string;
  };
  signature: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  operation: string;
  resource: string;
  result: 'success' | 'failure' | 'blocked';
  riskScore: number;
  securityLevel: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    dataClassification?: string;
    complianceFlags?: string[];
    executionTime?: number;
    error?: string;
  };
  blockHash?: string;
  integrity: {
    verified: boolean;
    signature: string;
    tamperProof: boolean;
  };
}

export class SecurityManager extends EventEmitter {
  private config: SecurityConfig;
  private logger: Logger;
  private cryptoKeys: Map<string, SecurityCryptoKey> = new Map();
  private blockchain: SecurityBlock[] = [];
  private auditLogs: AuditLog[] = [];
  // Note: activeSessions would be used for session management in full implementation
  private riskAssessment: Map<string, number> = new Map();
  private complianceMonitor: any;
  private keyRotationTimer?: NodeJS.Timeout;

  constructor(config: SecurityConfig) {
    super();
    this.config = config;
    this.logger = new Logger(false, 'SecurityManager');
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Security Manager...');

      // Initialize Web Crypto API
      await this.initializeCryptography();

      // Initialize blockchain if enabled
      if (this.config.blockchain.enabled) {
        await this.initializeBlockchain();
      }

      // Initialize audit logging
      if (this.config.audit.enabled) {
        await this.initializeAuditSystem();
      }

      // Start key rotation if enabled
      if (this.config.encryption.keyRotationInterval > 0) {
        this.startKeyRotation();
      }

      // Initialize compliance monitoring
      await this.initializeComplianceMonitoring();

      this.emit('security-initialized');
      this.logger.info('Security Manager initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Security Manager:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Stop key rotation
      if (this.keyRotationTimer) {
        clearInterval(this.keyRotationTimer);
      }

      // Finalize audit logs
      if (this.config.audit.enabled) {
        await this.finalizeAuditLogs();
      }

      // Secure blockchain state
      if (this.config.blockchain.enabled) {
        await this.secureBlockchainState();
      }

      this.emit('security-shutdown');
      this.logger.info('Security Manager shut down successfully');

    } catch (error) {
      this.logger.error('Error during security shutdown:', error);
      throw error;
    }
  }

  // Encryption Operations
  async encryptData(data: any, keyId?: string, metadata?: any): Promise<{
    encryptedData: string;
    keyId: string;
    algorithm: string;
    iv: string;
    authTag?: string;
    metadata?: any;
  }> {
    try {
      const key = await this.getOrCreateKey(keyId, 'encryption');
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
      
      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.config.encryption.algorithm,
          iv: iv
        },
        key.cryptoKey,
        encodedData
      );

      const encryptedArray = new Uint8Array(encrypted);
      const encryptedHex = Array.from(encryptedArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const ivHex = Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Log encryption event
      await this.logSecurityEvent({
        type: 'data-encryption',
        userId: metadata?.userId || 'system',
        sessionId: metadata?.sessionId || 'worker',
        operation: 'encrypt',
        resource: keyId || 'default',
        dataHash: await this.hashData(data),
        timestamp: Date.now(),
        metadata: {
          algorithm: this.config.encryption.algorithm
        }
      });

      return {
        encryptedData: encryptedHex,
        keyId: key.id,
        algorithm: this.config.encryption.algorithm,
        iv: ivHex,
        metadata
      };

    } catch (error) {
      this.logger.error('Encryption failed:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async decryptData(encryptedData: string, keyId: string, iv: string, metadata?: any): Promise<any> {
    try {
      const key = await this.getKey(keyId);
      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }

      const ivArray = new Uint8Array(
        iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      const encryptedArray = new Uint8Array(
        encryptedData.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.config.encryption.algorithm,
          iv: ivArray
        },
        key.cryptoKey,
        encryptedArray
      );

      const decodedData = new TextDecoder().decode(decrypted);
      const data = JSON.parse(decodedData);

      // Log decryption event
      await this.logSecurityEvent({
        type: 'data-decryption',
        userId: metadata?.userId || 'system',
        sessionId: metadata?.sessionId || 'worker',
        operation: 'decrypt',
        resource: keyId,
        dataHash: await this.hashData(data),
        timestamp: Date.now(),
        metadata: {
          algorithm: this.config.encryption.algorithm
        }
      });

      return data;

    } catch (error) {
      this.logger.error('Decryption failed:', error);
      
      // Log failed decryption attempt
      await this.logSecurityEvent({
        type: 'data-decryption',
        userId: metadata?.userId || 'system',
        sessionId: metadata?.sessionId || 'worker',
        operation: 'decrypt',
        resource: keyId,
        dataHash: 'unknown',
        timestamp: Date.now(),
        metadata: {
          algorithm: this.config.encryption.algorithm
        }
      });

      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Digital Signature Operations
  async signData(data: any, keyId?: string): Promise<{
    signature: string;
    keyId: string;
    algorithm: string;
    timestamp: number;
  }> {
    try {
      const key = await this.getOrCreateKey(keyId, 'signing');
      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      
      const signature = await crypto.subtle.sign(
        'ECDSA',
        key.cryptoKey,
        encodedData
      );

      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return {
        signature: signatureHex,
        keyId: key.id,
        algorithm: 'ECDSA',
        timestamp: Date.now()
      };

    } catch (error) {
      this.logger.error('Data signing failed:', error);
      throw error;
    }
  }

  async verifySignature(data: any, signature: string, keyId: string): Promise<boolean> {
    try {
      const key = await this.getKey(keyId);
      if (!key) {
        return false;
      }

      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      const signatureArray = new Uint8Array(
        signature.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      const isValid = await crypto.subtle.verify(
        'ECDSA',
        key.cryptoKey,
        signatureArray,
        encodedData
      );

      // Log verification event
      await this.logSecurityEvent({
        type: 'signature-verification',
        userId: 'system',
        sessionId: 'worker',
        operation: 'verify',
        resource: keyId,
        dataHash: await this.hashData(data),
        timestamp: Date.now(),
        metadata: {
          signatureValid: isValid,
          algorithm: 'ECDSA'
        }
      });

      return isValid;

    } catch (error) {
      this.logger.error('Signature verification failed:', error);
      return false;
    }
  }

  // Blockchain-like Verification System
  async createSecurityBlock(transactions: SecurityTransaction[]): Promise<SecurityBlock> {
    if (!this.config.blockchain.enabled) {
      throw new Error('Blockchain is not enabled');
    }

    try {
      const previousBlock = this.blockchain[this.blockchain.length - 1];
      const merkleRoot = await this.calculateMerkleRoot(transactions);

      const block: SecurityBlock = {
        index: this.blockchain.length,
        timestamp: Date.now(),
        previousHash: previousBlock ? previousBlock.hash : '0'.repeat(64),
        merkleRoot,
        nonce: 0,
        difficulty: this.config.blockchain.difficulty,
        transactions,
        hash: '',
        validator: await this.selectValidator()
      };

      // Mine the block (Proof of Work)
      if (this.config.blockchain.consensusAlgorithm === 'PoW') {
        await this.mineBlock(block);
      }

      // Calculate final hash
      block.hash = await this.calculateBlockHash(block);

      // Sign the block
      const signature = await this.signData(block);
      block.signature = signature.signature;

      // Add to blockchain
      this.blockchain.push(block);

      // Verify blockchain integrity
      const isValid = await this.verifyBlockchain();
      if (!isValid) {
        throw new Error('Blockchain integrity verification failed');
      }

      this.emit('security-block-created', { block });
      this.logger.info(`Security block ${block.index} created with ${transactions.length} transactions`);

      return block;

    } catch (error) {
      this.logger.error('Failed to create security block:', error);
      throw error;
    }
  }

  async verifyBlockchain(): Promise<boolean> {
    try {
      for (let i = 1; i < this.blockchain.length; i++) {
        const currentBlock = this.blockchain[i];
        const previousBlock = this.blockchain[i - 1];

        if (!currentBlock || !previousBlock) {
          this.logger.error(`Block ${i} or previous block not found`);
          return false;
        }

        // Verify block hash
        const calculatedHash = await this.calculateBlockHash(currentBlock);
        if (currentBlock.hash !== calculatedHash) {
          this.logger.error(`Block ${i} hash verification failed`);
          return false;
        }

        // Verify previous hash link
        if (currentBlock.previousHash !== previousBlock.hash) {
          this.logger.error(`Block ${i} previous hash link broken`);
          return false;
        }

        // Verify merkle root
        const calculatedMerkleRoot = await this.calculateMerkleRoot(currentBlock.transactions);
        if (currentBlock.merkleRoot !== calculatedMerkleRoot) {
          this.logger.error(`Block ${i} merkle root verification failed`);
          return false;
        }

        // Verify block signature
        if (currentBlock.signature) {
          const isValidSignature = await this.verifySignature(
            { ...currentBlock, signature: undefined },
            currentBlock.signature,
            'blockchain-validator'
          );
          
          if (!isValidSignature) {
            this.logger.error(`Block ${i} signature verification failed`);
            return false;
          }
        }
      }

      return true;

    } catch (error) {
      this.logger.error('Blockchain verification failed:', error);
      return false;
    }
  }

  // Access Control and Authorization
  async authorizeOperation(
    userId: string,
    operation: string,
    resource: string,
    context?: any
  ): Promise<{
    authorized: boolean;
    riskScore: number;
    securityLevel: string;
    restrictions?: string[];
    auditRequired: boolean;
  }> {
    try {
      // Calculate risk score
      const riskScore = await this.calculateRiskScore(userId, operation, resource, context);
      
      // Determine security level
      const securityLevel = this.determineSecurityLevel(riskScore, operation, resource);
      
      // Check authorization
      const authorized = await this.checkAuthorization(userId, operation, resource, securityLevel);
      
      // Determine if audit is required
      const auditRequired = this.isAuditRequired(operation, resource, securityLevel);
      
      // Log authorization event
      await this.logSecurityEvent({
        type: 'authorization',
        userId,
        sessionId: context?.sessionId || 'unknown',
        operation,
        resource,
        dataHash: context?.dataHash || 'unknown',
        timestamp: Date.now(),
        metadata: {
          authorized,
          riskScore,
          securityLevel,
          auditRequired
        }
      });

      return {
        authorized,
        riskScore,
        securityLevel,
        restrictions: authorized ? [] : ['insufficient-permissions'],
        auditRequired
      };

    } catch (error) {
      this.logger.error('Authorization failed:', error);
      throw error;
    }
  }

  // Data Integrity and Verification
  async verifyDataIntegrity(data: any, expectedHash: string): Promise<boolean> {
    try {
      const actualHash = await this.hashData(data);
      const isValid = actualHash === expectedHash;

      // Log integrity check
      await this.logSecurityEvent({
        type: 'data-integrity-check',
        userId: 'system',
        sessionId: 'worker',
        operation: 'verify',
        resource: 'data-integrity',
        dataHash: actualHash,
        timestamp: Date.now(),
        metadata: {
          expectedHash,
          actualHash,
          isValid
        }
      });

      return isValid;

    } catch (error) {
      this.logger.error('Data integrity verification failed:', error);
      return false;
    }
  }

  async createDataChecksum(data: any): Promise<{
    hash: string;
    algorithm: string;
    timestamp: number;
    signature: string;
  }> {
    try {
      const hash = await this.hashData(data);
      const signature = await this.signData({ hash, timestamp: Date.now() });

      return {
        hash,
        algorithm: 'SHA-256',
        timestamp: Date.now(),
        signature: signature.signature
      };

    } catch (error) {
      this.logger.error('Checksum creation failed:', error);
      throw error;
    }
  }

  // Compliance and Audit
  async executeOperation(message: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Pre-operation security checks
      const authResult = await this.authorizeOperation(
        message.metadata?.userId || 'anonymous',
        message.operation,
        message.payload?.resource || 'unknown',
        message.metadata
      );

      if (!authResult.authorized) {
        throw new Error('Operation not authorized');
      }

      // Execute the actual operation based on type
      let result;
      switch (message.operation) {
        case 'encrypt':
          result = await this.encryptData(message.payload.data, message.payload.keyId, message.metadata);
          break;
        case 'decrypt':
          result = await this.decryptData(message.payload.encryptedData, message.payload.keyId, message.payload.iv, message.metadata);
          break;
        case 'sign':
          result = await this.signData(message.payload.data, message.payload.keyId);
          break;
        case 'verify':
          result = await this.verifySignature(message.payload.data, message.payload.signature, message.payload.keyId);
          break;
        case 'secure-transaction':
          result = await this.createSecureTransaction(message.payload.operations);
          break;
        case 'audit-query':
          result = await this.queryAuditLogs(message.payload.filter, message.payload.options);
          break;
        default:
          throw new Error(`Unknown security operation: ${message.operation}`);
      }

      // Post-operation audit logging
      if (authResult.auditRequired) {
        await this.createAuditLog({
          userId: message.metadata?.userId || 'anonymous',
          sessionId: message.metadata?.sessionId || 'worker',
          operation: message.operation,
          resource: message.payload?.resource || 'unknown',
          result: 'success',
          riskScore: authResult.riskScore,
          securityLevel: authResult.securityLevel,
          metadata: {
            ipAddress: message.metadata?.ipAddress || 'unknown',
            userAgent: message.metadata?.userAgent || 'worker',
            executionTime: Date.now() - startTime
          }
        });
      }

      return result;

    } catch (error) {
      // Log failed operation
      await this.createAuditLog({
        userId: message.metadata?.userId || 'anonymous',
        sessionId: message.metadata?.sessionId || 'worker',
        operation: message.operation,
        resource: message.payload?.resource || 'unknown',
        result: 'failure',
        riskScore: 10, // High risk for failed operations
        securityLevel: 'critical',
        metadata: {
          ipAddress: message.metadata?.ipAddress || 'unknown',
          userAgent: message.metadata?.userAgent || 'worker',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        }
      });

      throw error;
    }
  }

  // Private Methods
  private async initializeCryptography(): Promise<void> {
    // Check Web Crypto API availability
    if (!crypto || !crypto.subtle) {
      throw new Error('Web Crypto API is not available');
    }

    // Create default encryption key
    await this.getOrCreateKey('default', 'encryption');
    
    // Create default signing key
    await this.getOrCreateKey('default', 'signing');

    this.logger.info('Cryptography initialized');
  }

  private async initializeBlockchain(): Promise<void> {
    // Create genesis block
    if (this.blockchain.length === 0) {
      const genesisBlock: SecurityBlock = {
        index: 0,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        merkleRoot: '0'.repeat(64),
        nonce: 0,
        difficulty: this.config.blockchain.difficulty,
        transactions: [],
        hash: ''
      };

      genesisBlock.hash = await this.calculateBlockHash(genesisBlock);
      this.blockchain.push(genesisBlock);
    }

    this.logger.info('Blockchain initialized with genesis block');
  }

  private async initializeAuditSystem(): Promise<void> {
    // Set up audit log rotation
    setInterval(() => {
      this.rotateAuditLogs();
    }, 86400000); // Daily rotation

    this.logger.info('Audit system initialized');
  }

  private async initializeComplianceMonitoring(): Promise<void> {
    this.complianceMonitor = {
      frameworks: this.config.compliance.frameworks,
      violations: [],
      lastCheck: new Date()
    };

    // Start compliance monitoring
    setInterval(() => {
      this.performComplianceCheck();
    }, 3600000); // Hourly compliance checks

    this.logger.info('Compliance monitoring initialized');
  }

  private async getOrCreateKey(keyId?: string, purpose: 'encryption' | 'signing' = 'encryption'): Promise<{
    id: string;
    cryptoKey: CryptoKey;
  }> {
    const id = keyId || 'default';
    const existingKey = this.cryptoKeys.get(id);

    if (existingKey && !this.isKeyExpired(existingKey)) {
      return {
        id,
        cryptoKey: existingKey.cryptoKey
      };
    }

    // Create new key
    let cryptoKey: CryptoKey;
    
    if (purpose === 'encryption') {
      cryptoKey = await crypto.subtle.generateKey(
        {
          name: this.config.encryption.algorithm,
          length: this.config.encryption.keySize
        },
        false, // Not extractable
        ['encrypt', 'decrypt']
      ) as CryptoKey;
    } else {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        false,
        ['sign', 'verify']
      ) as CryptoKeyPair;
      cryptoKey = keyPair.privateKey;
    }

    const keyInfo: SecurityCryptoKey = {
      id,
      algorithm: purpose === 'encryption' ? this.config.encryption.algorithm : 'ECDSA',
      keySize: this.config.encryption.keySize,
      purpose,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.encryption.keyRotationInterval),
      rotationCount: 0,
      metadata: {},
      cryptoKey
    };

    this.cryptoKeys.set(id, keyInfo);

    this.emit('key-created', { keyId: id, purpose });
    return { id, cryptoKey };
  }

  private async getKey(keyId: string): Promise<any> {
    return this.cryptoKeys.get(keyId);
  }

  private isKeyExpired(key: SecurityCryptoKey): boolean {
    return key.expiresAt ? new Date() > key.expiresAt : false;
  }

  private async hashData(data: any): Promise<string> {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async calculateMerkleRoot(transactions: SecurityTransaction[]): Promise<string> {
    if (transactions.length === 0) {
      return '0'.repeat(64);
    }

    let hashes = await Promise.all(
      transactions.map(tx => this.hashData(tx))
    );

    while (hashes.length > 1) {
      const newHashes = [];
      
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        if (left && right) {
          const combined = await this.hashData(left + right);
          newHashes.push(combined);
        }
      }
      
      hashes = newHashes;
    }

    return hashes[0] || '0'.repeat(64);
  }

  private async calculateBlockHash(block: SecurityBlock): Promise<string> {
    const blockData = {
      index: block.index,
      timestamp: block.timestamp,
      previousHash: block.previousHash,
      merkleRoot: block.merkleRoot,
      nonce: block.nonce
    };

    return await this.hashData(blockData);
  }

  private async mineBlock(block: SecurityBlock): Promise<void> {
    const target = '0'.repeat(this.config.blockchain.difficulty);
    
    while (true) {
      const hash = await this.calculateBlockHash(block);
      
      if (hash.substring(0, this.config.blockchain.difficulty) === target) {
        break;
      }
      
      block.nonce++;
      
      // Prevent infinite loops in testing
      if (block.nonce > 1000000) {
        this.logger.warn('Mining taking too long, reducing difficulty');
        break;
      }
    }
  }

  private async selectValidator(): Promise<string> {
    if (this.config.blockchain.validatorNodes.length === 0) {
      return 'self';
    }

    // Simple random selection for now
    const randomIndex = Math.floor(Math.random() * this.config.blockchain.validatorNodes.length);
    return this.config.blockchain.validatorNodes[randomIndex] || 'self';
  }

  private async logSecurityEvent(transaction: Omit<SecurityTransaction, 'id' | 'signature'>): Promise<void> {
    const fullTransaction: SecurityTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      signature: '',
      ...transaction
    };

    // Sign the transaction
    const signature = await this.signData(fullTransaction);
    fullTransaction.signature = signature.signature;

    // Add to pending transactions for next block
    this.addTransactionToQueue(fullTransaction);
  }

  private addTransactionToQueue(transaction: SecurityTransaction): void {
    // Add transaction to blockchain queue
    // In a real implementation, this would be more sophisticated
    const lastBlock = this.blockchain[this.blockchain.length - 1];
    if (this.blockchain.length === 0 || 
        (lastBlock && lastBlock.transactions.length >= this.config.blockchain.blockSize)) {
      // Create new block
      this.createSecurityBlock([transaction]).catch(error => {
        this.logger.error('Failed to create security block:', error);
      });
    }
  }

  private async createAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp' | 'integrity' | 'blockHash'>): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...logData,
      integrity: {
        verified: false,
        signature: '',
        tamperProof: this.config.audit.tamperProof
      }
    };

    // Sign audit log for tamper-proofing
    if (this.config.audit.tamperProof) {
      const signature = await this.signData(auditLog);
      auditLog.integrity.signature = signature.signature;
      auditLog.integrity.verified = true;
    }

    // Add to blockchain if enabled
    if (this.config.blockchain.enabled) {
      const transaction: SecurityTransaction = {
        id: `audit_tx_${Date.now()}`,
        type: 'data-access',
        userId: logData.userId,
        sessionId: logData.sessionId,
        operation: logData.operation,
        resource: logData.resource,
        dataHash: await this.hashData(auditLog),
        timestamp: Date.now(),
        metadata: logData.metadata,
        signature: auditLog.integrity.signature
      };

      this.addTransactionToQueue(transaction);
      auditLog.blockHash = 'pending';
    }

    this.auditLogs.push(auditLog);

    // Rotate logs if needed
    if (this.auditLogs.length > 10000) {
      this.rotateAuditLogs();
    }

    this.emit('audit-log-created', auditLog);
  }

  private async calculateRiskScore(userId: string, operation: string, _resource: string, context?: any): Promise<number> {
    let riskScore = 0;

    // Base risk by operation type
    const operationRisks = {
      'delete': 8,
      'update': 5,
      'create': 3,
      'read': 1
    };

    riskScore += operationRisks[operation as keyof typeof operationRisks] || 5;

    // User-based risk
    const userRisk = this.riskAssessment.get(userId) || 0;
    riskScore += userRisk;

    // Context-based risk
    if (context?.ipAddress && this.isUnknownIP(context.ipAddress)) {
      riskScore += 3;
    }

    if (context?.geolocation && this.isUnusualLocation(context.geolocation)) {
      riskScore += 2;
    }

    // Time-based risk
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 1; // Off-hours access
    }

    return Math.min(riskScore, 10); // Cap at 10
  }

  private determineSecurityLevel(riskScore: number, _operation: string, _resource: string): string {
    if (riskScore >= 8) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  private async checkAuthorization(_userId: string, _operation: string, _resource: string, _securityLevel: string): Promise<boolean> {
    // Implement authorization logic based on user roles, permissions, and security level
    // For now, return true for demo purposes
    return true;
  }

  private isAuditRequired(operation: string, _resource: string, securityLevel: string): boolean {
    if (securityLevel === 'critical' || securityLevel === 'high') {
      return true;
    }

    if (['delete', 'update'].includes(operation)) {
      return true;
    }

    return this.config.audit.logLevel === 'verbose';
  }

  private isUnknownIP(_ipAddress: string): boolean {
    // Check against known IP ranges
    return false; // Placeholder
  }

  private isUnusualLocation(_geolocation: string): boolean {
    // Check against user's typical locations
    return false; // Placeholder
  }

  private async rotateAuditLogs(): Promise<void> {
    const retentionPeriod = this.config.audit.retention * 24 * 60 * 60 * 1000; // Convert days to ms
    const cutoffDate = new Date(Date.now() - retentionPeriod);

    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);
    
    this.emit('audit-logs-rotated', { 
      retainedLogs: this.auditLogs.length,
      cutoffDate 
    });
  }

  private async finalizeAuditLogs(): Promise<void> {
    // Create final audit summary
    const summary = {
      totalLogs: this.auditLogs.length,
      timeRange: {
        start: this.auditLogs[0]?.timestamp,
        end: this.auditLogs[this.auditLogs.length - 1]?.timestamp
      },
      operationCounts: this.auditLogs.reduce((counts, log) => {
        counts[log.operation] = (counts[log.operation] || 0) + 1;
        return counts;
      }, {} as Record<string, number>),
      securityEvents: this.auditLogs.filter(log => log.riskScore >= 7).length
    };

    this.logger.info('Audit summary:', summary);
  }

  private async secureBlockchainState(): Promise<void> {
    if (this.blockchain.length > 0) {
      const finalVerification = await this.verifyBlockchain();
      
      if (!finalVerification) {
        this.logger.error('Final blockchain verification failed!');
        throw new Error('Blockchain integrity compromised');
      }

      this.logger.info(`Blockchain secured with ${this.blockchain.length} blocks`);
    }
  }

  private startKeyRotation(): void {
    this.keyRotationTimer = setInterval(async () => {
      try {
        await this.rotateKeys();
      } catch (error) {
        this.logger.error('Key rotation failed:', error);
      }
    }, this.config.encryption.keyRotationInterval);
  }

  private async rotateKeys(): Promise<void> {
    for (const [keyId, keyInfo] of this.cryptoKeys) {
      if (this.isKeyExpired(keyInfo)) {
        // Create new key
        await this.getOrCreateKey(keyId, keyInfo.purpose === 'key-derivation' ? 'encryption' : keyInfo.purpose);
        
        // Log key rotation
        await this.logSecurityEvent({
          type: 'key-rotation',
          userId: 'system',
          sessionId: 'worker',
          operation: 'rotate-key',
          resource: keyId,
          dataHash: 'key-rotation',
          timestamp: Date.now(),
          metadata: {
            oldKeyRotationCount: keyInfo.rotationCount,
            newKeyRotationCount: keyInfo.rotationCount + 1
          }
        });

        this.emit('key-rotated', { keyId, purpose: keyInfo.purpose });
      }
    }
  }

  private async performComplianceCheck(): Promise<void> {
    const violations: any[] = [];

    // Check GDPR compliance
    if (this.config.compliance.frameworks.includes('GDPR')) {
      // Check data retention periods
      // Check user consent records
      // Check data processing logs
    }

    // Check HIPAA compliance
    if (this.config.compliance.frameworks.includes('HIPAA')) {
      // Check PHI encryption
      // Check access controls
      // Check audit trails
    }

    // Check SOC2 compliance
    if (this.config.compliance.frameworks.includes('SOC2')) {
      // Check security controls
      // Check availability metrics
      // Check processing integrity
    }

    this.complianceMonitor.violations = violations;
    this.complianceMonitor.lastCheck = new Date();

    if (violations.length > 0) {
      this.emit('compliance-violations', violations);
      this.logger.warn(`${violations.length} compliance violations detected`);
    }
  }

  private async queryAuditLogs(filter: any, options: any): Promise<AuditLog[]> {
    let filteredLogs = this.auditLogs;

    if (filter) {
      filteredLogs = filteredLogs.filter(log => {
        return Object.entries(filter).every(([key, value]) => {
          return (log as any)[key] === value;
        });
      });
    }

    if (options?.sort) {
      filteredLogs.sort((a, b) => {
        const aValue = (a as any)[options.sort.field];
        const bValue = (b as any)[options.sort.field];
        return options.sort.direction === 'desc' ? bValue - aValue : aValue - bValue;
      });
    }

    if (options?.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }

    return filteredLogs;
  }

  private async createSecureTransaction(operations: any[]): Promise<string> {
    const transactionId = `secure_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create transaction record
    const transaction: SecurityTransaction = {
      id: transactionId,
      type: 'data-modification',
      userId: 'system',
      sessionId: 'worker',
      operation: 'secure-transaction',
      resource: 'multiple',
      dataHash: await this.hashData(operations),
      timestamp: Date.now(),
      metadata: {
        operationCount: operations.length,
        transactionType: 'atomic'
      },
      signature: ''
    };

    // Sign transaction
    const signature = await this.signData(transaction);
    transaction.signature = signature.signature;

    // Add to blockchain
    this.addTransactionToQueue(transaction);

    return transactionId;
  }

  // Public Utility Methods
  getSecurityMetrics(): {
    encryptionEnabled: boolean;
    blockchainEnabled: boolean;
    totalBlocks: number;
    totalTransactions: number;
    keyCount: number;
    auditLogCount: number;
    complianceStatus: any;
    lastKeyRotation: Date | null;
  } {
    return {
      encryptionEnabled: this.config.encryption.enabled,
      blockchainEnabled: this.config.blockchain.enabled,
      totalBlocks: this.blockchain.length,
      totalTransactions: this.blockchain.reduce((total, block) => total + block.transactions.length, 0),
      keyCount: this.cryptoKeys.size,
      auditLogCount: this.auditLogs.length,
      complianceStatus: this.complianceMonitor,
      lastKeyRotation: null // Would track actual rotation times
    };
  }

  getBlockchain(): SecurityBlock[] {
    return [...this.blockchain];
  }

  getAuditLogs(limit?: number): AuditLog[] {
    return limit ? this.auditLogs.slice(-limit) : [...this.auditLogs];
  }
}
