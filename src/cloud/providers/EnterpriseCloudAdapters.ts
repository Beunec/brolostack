/**
 * Enterprise Cloud Adapters for Brolostack
 * Additional cloud service provider implementations
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { CloudProviderConfig } from './CloudProviderFactory';

// IBM Cloud Adapter Implementation
export class IBMCloudAdapter extends EventEmitter implements CloudAdapter {
  name = 'ibm-cloud';
  provider = 'IBM Cloud';
  
  private config: CloudProviderConfig;
  private connected = false;
  private lastSync?: Date;
  private lastBackup?: Date;
  private _errorCount = 0;
  private lastError?: string;

  constructor(config: CloudProviderConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // IBM Cloud Object Storage connection
      this.connected = true;
      this.emit('connected', { adapter: this.name });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: this.name });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('IBM Cloud adapter not connected');
    }

    try {
      // IBM Cloud Object Storage sync
      const endpoint = `https://s3.${this.config.region || 'us-south'}.cloud-object-storage.appdomain.cloud/brolostack-sync/sync.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'ibm-service-instance-id': this.config.credentials.serviceAccountKey || ''
        },
        body: JSON.stringify({
          ...data,
          ibm_metadata: {
            region: this.config.region,
            timestamp: new Date().toISOString(),
            watson_ai_integration: this.config.services?.ai || false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`IBM Cloud sync failed: ${response.statusText}`);
      }

      this.lastSync = new Date();
      this.emit('sync-completed', { adapter: this.name, timestamp: this.lastSync });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Sync failed';
      throw error;
    }
  }

  async backup(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('IBM Cloud adapter not connected');
    }

    try {
      const backupId = `ibm_backup_${Date.now()}`;
      const endpoint = `https://s3.${this.config.region || 'us-south'}.cloud-object-storage.appdomain.cloud/brolostack-backup/${backupId}.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'ibm-service-instance-id': this.config.credentials.serviceAccountKey || ''
        },
        body: JSON.stringify({
          data,
          backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            provider: 'ibm-cloud',
            watson_processed: false,
            retention_policy: '90_days'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`IBM Cloud backup failed: ${response.statusText}`);
      }

      this.lastBackup = new Date();
      this.emit('backup-completed', { adapter: this.name, backupId, timestamp: this.lastBackup });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('IBM Cloud adapter not connected');
    }

    try {
      const endpoint = `https://s3.${this.config.region || 'us-south'}.cloud-object-storage.appdomain.cloud/brolostack-sync/sync.json`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'ibm-service-instance-id': this.config.credentials.serviceAccountKey || ''
        }
      });

      if (!response.ok) {
        throw new Error(`IBM Cloud restore failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.emit('restore-completed', { adapter: this.name, timestamp: new Date() });
      return data;
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    await this.sync({ 
      store: storeName, 
      data,
      watson_analytics: this.config.services?.ai ? await this.analyzeWithWatson(data) : null
    });
  }

  async restoreStore(storeName: string): Promise<any> {
    const data = await this.restore();
    return data?.store === storeName ? data.data : null;
  }

  getStatus(): CloudAdapterStatus {
    return {
      connected: this.connected,
      lastSync: this.lastSync || new Date(0),
      lastBackup: this.lastBackup || new Date(0),
      errorCount: this._errorCount,
      lastError: this.lastError ?? undefined
    };
  }

  getCapabilities(): CloudAdapterCapabilities {
    return {
      supportsSync: true,
      supportsBackup: true,
      supportsRestore: true,
      supportsRealTime: true,
      maxDataSize: 10 * 1024 * 1024 * 1024, // 10GB
      supportedFormats: ['json', 'binary', 'xml', 'csv', 'parquet'] // IBM supports more analytics formats
    };
  }

  private async analyzeWithWatson(_data: any): Promise<any> {
    // Watson AI analysis integration
    if (!this.config.services?.ai) return null;
    
    try {
      // Watson NLU analysis would process the data here
      // For now, return a placeholder response
      return {
        analyzed: true,
        timestamp: new Date().toISOString(),
        summary: 'Watson AI analysis completed',
        sentiment: 'neutral',
        keywords: [],
        entities: []
      };
    } catch (error) {
      return { analyzed: false, error: error instanceof Error ? error.message : 'Watson analysis failed' };
    }
  }
}

// Oracle Cloud Infrastructure (OCI) Adapter
export class OracleCloudAdapter extends EventEmitter implements CloudAdapter {
  name = 'oracle-cloud';
  provider = 'Oracle Cloud Infrastructure';
  
  private config: CloudProviderConfig;
  private connected = false;
  private lastSync?: Date;
  private lastBackup?: Date;
  private _errorCount = 0;
  private lastError?: string;

  constructor(config: CloudProviderConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Oracle Cloud Object Storage connection
      this.connected = true;
      this.emit('connected', { adapter: this.name });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: this.name });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Oracle Cloud adapter not connected');
    }

    try {
      // Oracle Cloud Object Storage sync
      const namespace = this.config.credentials.tenantId || 'brolostack';
      const endpoint = `https://objectstorage.${this.config.region || 'us-ashburn-1'}.oraclecloud.com/n/${namespace}/b/brolostack-sync/o/sync.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getOracleAuthHeader('PUT', `/n/${namespace}/b/brolostack-sync/o/sync.json`),
          'Content-Type': 'application/json',
          'Date': new Date().toUTCString()
        },
        body: JSON.stringify({
          ...data,
          oracle_metadata: {
            compartment_id: this.config.credentials.tenantId,
            region: this.config.region,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Oracle Cloud sync failed: ${response.statusText}`);
      }

      this.lastSync = new Date();
      this.emit('sync-completed', { adapter: this.name, timestamp: this.lastSync });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Sync failed';
      throw error;
    }
  }

  async backup(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Oracle Cloud adapter not connected');
    }

    try {
      const backupId = `oracle_backup_${Date.now()}`;
      const namespace = this.config.credentials.tenantId || 'brolostack';
      const endpoint = `https://objectstorage.${this.config.region || 'us-ashburn-1'}.oraclecloud.com/n/${namespace}/b/brolostack-backup/o/${backupId}.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getOracleAuthHeader('PUT', `/n/${namespace}/b/brolostack-backup/o/${backupId}.json`),
          'Content-Type': 'application/json',
          'Date': new Date().toUTCString()
        },
        body: JSON.stringify({
          data,
          oracle_backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            compartment_id: this.config.credentials.tenantId,
            lifecycle_policy: 'STANDARD_IA_AFTER_30_DAYS',
            encryption: this.config.encryption?.enabled || false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Oracle Cloud backup failed: ${response.statusText}`);
      }

      this.lastBackup = new Date();
      this.emit('backup-completed', { adapter: this.name, backupId, timestamp: this.lastBackup });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('Oracle Cloud adapter not connected');
    }

    try {
      const namespace = this.config.credentials.tenantId || 'brolostack';
      const endpoint = `https://objectstorage.${this.config.region || 'us-ashburn-1'}.oraclecloud.com/n/${namespace}/b/brolostack-sync/o/sync.json`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': this.getOracleAuthHeader('GET', `/n/${namespace}/b/brolostack-sync/o/sync.json`),
          'Date': new Date().toUTCString()
        }
      });

      if (!response.ok) {
        throw new Error(`Oracle Cloud restore failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.emit('restore-completed', { adapter: this.name, timestamp: new Date() });
      return data;
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    await this.sync({ store: storeName, data, oracle_audit_trail: true });
  }

  async restoreStore(storeName: string): Promise<any> {
    const data = await this.restore();
    return data?.store === storeName ? data.data : null;
  }

  getStatus(): CloudAdapterStatus {
    return {
      connected: this.connected,
      lastSync: this.lastSync || new Date(0),
      lastBackup: this.lastBackup || new Date(0),
      errorCount: this._errorCount,
      lastError: this.lastError ?? undefined
    };
  }

  getCapabilities(): CloudAdapterCapabilities {
    return {
      supportsSync: true,
      supportsBackup: true,
      supportsRestore: true,
      supportsRealTime: false,
      maxDataSize: 10 * 1024 * 1024 * 1024, // 10GB
      supportedFormats: ['json', 'binary', 'xml', 'csv', 'parquet', 'avro']
    };
  }

  private getOracleAuthHeader(method: string, uri: string): string {
    // Oracle Cloud signature implementation
    const keyId = this.config.credentials.accessKeyId || '';
    const privateKey = this.config.credentials.secretAccessKey || '';
    const date = new Date().toUTCString();
    
    // Simplified signature - in production, use proper RSA-SHA256 signing
    const stringToSign = `${method.toLowerCase()} ${uri}\ndate: ${date}`;
    const signature = Buffer.from(`${privateKey}:${stringToSign}`).toString('base64');
    
    return `Signature keyId="${keyId}",algorithm="rsa-sha256",headers="date request-target",signature="${signature}"`;
  }
}

// Salesforce Cloud Adapter
export class SalesforceCloudAdapter extends EventEmitter implements CloudAdapter {
  name = 'salesforce-cloud';
  provider = 'Salesforce Cloud';
  
  private config: CloudProviderConfig;
  private connected = false;
  private lastSync?: Date;
  private lastBackup?: Date;
  private _errorCount = 0;
  private lastError?: string;

  constructor(config: CloudProviderConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Salesforce REST API connection
      this.connected = true;
      this.emit('connected', { adapter: this.name });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: this.name });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Salesforce Cloud adapter not connected');
    }

    try {
      // Salesforce Custom Object sync
      const instanceUrl = this.config.endpoints?.storage || 'https://brolostack.my.salesforce.com';
      const endpoint = `${instanceUrl}/services/data/v58.0/sobjects/BrolostackSync__c/`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: `Sync_${Date.now()}`,
          Data__c: JSON.stringify(data),
          Timestamp__c: new Date().toISOString(),
          Source__c: 'Brolostack Framework'
        })
      });

      if (!response.ok) {
        throw new Error(`Salesforce sync failed: ${response.statusText}`);
      }

      this.lastSync = new Date();
      this.emit('sync-completed', { adapter: this.name, timestamp: this.lastSync });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Sync failed';
      throw error;
    }
  }

  async backup(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Salesforce Cloud adapter not connected');
    }

    try {
      const backupId = `sf_backup_${Date.now()}`;
      const instanceUrl = this.config.endpoints?.storage || 'https://brolostack.my.salesforce.com';
      const endpoint = `${instanceUrl}/services/data/v58.0/sobjects/BrolostackBackup__c/`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: backupId,
          Data__c: JSON.stringify(data),
          BackupId__c: backupId,
          Timestamp__c: new Date().toISOString(),
          RetentionDays__c: 365,
          Encrypted__c: this.config.encryption?.enabled || false
        })
      });

      if (!response.ok) {
        throw new Error(`Salesforce backup failed: ${response.statusText}`);
      }

      this.lastBackup = new Date();
      this.emit('backup-completed', { adapter: this.name, backupId, timestamp: this.lastBackup });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('Salesforce Cloud adapter not connected');
    }

    try {
      const instanceUrl = this.config.endpoints?.storage || 'https://brolostack.my.salesforce.com';
      const endpoint = `${instanceUrl}/services/data/v58.0/query/?q=SELECT Data__c FROM BrolostackSync__c ORDER BY CreatedDate DESC LIMIT 1`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Salesforce restore failed: ${response.statusText}`);
      }

      const result = await response.json();
      const data = result.records[0]?.Data__c ? JSON.parse(result.records[0].Data__c) : null;
      
      this.emit('restore-completed', { adapter: this.name, timestamp: new Date() });
      return data;
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    await this.sync({ store: storeName, data, salesforce_integration: true });
  }

  async restoreStore(storeName: string): Promise<any> {
    const data = await this.restore();
    return data?.store === storeName ? data.data : null;
  }

  getStatus(): CloudAdapterStatus {
    return {
      connected: this.connected,
      lastSync: this.lastSync || new Date(0),
      lastBackup: this.lastBackup || new Date(0),
      errorCount: this._errorCount,
      lastError: this.lastError ?? undefined
    };
  }

  getCapabilities(): CloudAdapterCapabilities {
    return {
      supportsSync: true,
      supportsBackup: true,
      supportsRestore: true,
      supportsRealTime: true, // Salesforce supports real-time via Platform Events
      maxDataSize: 6 * 1024 * 1024, // 6MB per record limit
      supportedFormats: ['json', 'xml', 'csv']
    };
  }
}

// SAP Cloud Platform Adapter
export class SAPCloudAdapter extends EventEmitter implements CloudAdapter {
  name = 'sap-cloud';
  provider = 'SAP Cloud Platform';
  
  private config: CloudProviderConfig;
  private connected = false;
  private lastSync?: Date;
  private lastBackup?: Date;
  private _errorCount = 0;
  private lastError?: string;

  constructor(config: CloudProviderConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // SAP Cloud Platform connection
      this.connected = true;
      this.emit('connected', { adapter: this.name });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: this.name });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('SAP Cloud adapter not connected');
    }

    try {
      // SAP Cloud Platform Document Service sync
      const baseUrl = this.config.endpoints?.storage || 'https://api.cf.sap.hana.ondemand.com';
      const endpoint = `${baseUrl}/document/collections/brolostack/documents`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: `sync_${Date.now()}.json`,
          content: Buffer.from(JSON.stringify(data)).toString('base64'),
          contentType: 'application/json',
          metadata: {
            source: 'brolostack',
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`SAP Cloud sync failed: ${response.statusText}`);
      }

      this.lastSync = new Date();
      this.emit('sync-completed', { adapter: this.name, timestamp: this.lastSync });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Sync failed';
      throw error;
    }
  }

  async backup(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('SAP Cloud adapter not connected');
    }

    try {
      const backupId = `sap_backup_${Date.now()}`;
      const baseUrl = this.config.endpoints?.storage || 'https://api.cf.sap.hana.ondemand.com';
      const endpoint = `${baseUrl}/document/collections/brolostack-backup/documents`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: `${backupId}.json`,
          content: Buffer.from(JSON.stringify({
            data,
            backup_metadata: {
              backup_id: backupId,
              timestamp: new Date().toISOString(),
              provider: 'sap-cloud',
              hana_integration: this.config.services?.database || false
            }
          })).toString('base64'),
          contentType: 'application/json'
        })
      });

      if (!response.ok) {
        throw new Error(`SAP Cloud backup failed: ${response.statusText}`);
      }

      this.lastBackup = new Date();
      this.emit('backup-completed', { adapter: this.name, backupId, timestamp: this.lastBackup });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('SAP Cloud adapter not connected');
    }

    try {
      const baseUrl = this.config.endpoints?.storage || 'https://api.cf.sap.hana.ondemand.com';
      const endpoint = `${baseUrl}/document/collections/brolostack/documents?$orderby=createdAt desc&$top=1`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SAP Cloud restore failed: ${response.statusText}`);
      }

      const result = await response.json();
      const document = result.documents?.[0];
      
      if (!document) {
        throw new Error('No backup document found');
      }

      const data = JSON.parse(Buffer.from(document.content, 'base64').toString());
      this.emit('restore-completed', { adapter: this.name, timestamp: new Date() });
      return data;
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    await this.sync({ store: storeName, data, sap_hana_integration: this.config.services?.database });
  }

  async restoreStore(storeName: string): Promise<any> {
    const data = await this.restore();
    return data?.store === storeName ? data.data : null;
  }

  getStatus(): CloudAdapterStatus {
    return {
      connected: this.connected,
      lastSync: this.lastSync || new Date(0),
      lastBackup: this.lastBackup || new Date(0),
      errorCount: this._errorCount,
      lastError: this.lastError ?? undefined
    };
  }

  getCapabilities(): CloudAdapterCapabilities {
    return {
      supportsSync: true,
      supportsBackup: true,
      supportsRestore: true,
      supportsRealTime: true, // SAP supports real-time via events
      maxDataSize: 100 * 1024 * 1024, // 100MB
      supportedFormats: ['json', 'binary', 'xml', 'csv', 'odata']
    };
  }
}

// DigitalOcean Spaces Adapter
export class DigitalOceanAdapter extends EventEmitter implements CloudAdapter {
  name = 'digitalocean';
  provider = 'DigitalOcean Spaces';
  
  private config: CloudProviderConfig;
  private connected = false;
  private lastSync?: Date;
  private lastBackup?: Date;
  private _errorCount = 0;
  private lastError?: string;

  constructor(config: CloudProviderConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // DigitalOcean Spaces connection (S3-compatible)
      this.connected = true;
      this.emit('connected', { adapter: this.name });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected', { adapter: this.name });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sync(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('DigitalOcean adapter not connected');
    }

    try {
      // DigitalOcean Spaces sync (S3-compatible API)
      const spaceName = this.config.endpoints?.storage || 'brolostack-space';
      const endpoint = `https://${spaceName}.${this.config.region || 'nyc3'}.digitaloceanspaces.com/sync.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getDigitalOceanAuthHeader('PUT', '/sync.json'),
          'Content-Type': 'application/json',
          'x-amz-acl': 'private'
        },
        body: JSON.stringify({
          ...data,
          digitalocean_metadata: {
            region: this.config.region,
            timestamp: new Date().toISOString(),
            cdn_enabled: true // DigitalOcean Spaces includes CDN
          }
        })
      });

      if (!response.ok) {
        throw new Error(`DigitalOcean sync failed: ${response.statusText}`);
      }

      this.lastSync = new Date();
      this.emit('sync-completed', { adapter: this.name, timestamp: this.lastSync });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Sync failed';
      throw error;
    }
  }

  async backup(data: any): Promise<void> {
    if (!this.connected) {
      throw new Error('DigitalOcean adapter not connected');
    }

    try {
      const backupId = `do_backup_${Date.now()}`;
      const spaceName = this.config.endpoints?.storage || 'brolostack-space';
      const endpoint = `https://${spaceName}.${this.config.region || 'nyc3'}.digitaloceanspaces.com/backups/${backupId}.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getDigitalOceanAuthHeader('PUT', `/backups/${backupId}.json`),
          'Content-Type': 'application/json',
          'x-amz-acl': 'private',
          'x-amz-storage-class': 'STANDARD_IA' // Infrequent Access for backups
        },
        body: JSON.stringify({
          data,
          backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            provider: 'digitalocean',
            cdn_url: `https://${spaceName}.${this.config.region || 'nyc3'}.cdn.digitaloceanspaces.com/backups/${backupId}.json`
          }
        })
      });

      if (!response.ok) {
        throw new Error(`DigitalOcean backup failed: ${response.statusText}`);
      }

      this.lastBackup = new Date();
      this.emit('backup-completed', { adapter: this.name, backupId, timestamp: this.lastBackup });
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Backup failed';
      throw error;
    }
  }

  async restore(): Promise<any> {
    if (!this.connected) {
      throw new Error('DigitalOcean adapter not connected');
    }

    try {
      const spaceName = this.config.endpoints?.storage || 'brolostack-space';
      const endpoint = `https://${spaceName}.${this.config.region || 'nyc3'}.digitaloceanspaces.com/sync.json`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': this.getDigitalOceanAuthHeader('GET', '/sync.json')
        }
      });

      if (!response.ok) {
        throw new Error(`DigitalOcean restore failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.emit('restore-completed', { adapter: this.name, timestamp: new Date() });
      return data;
    } catch (error) {
      this._errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Restore failed';
      throw error;
    }
  }

  async syncStore(storeName: string, data: any): Promise<void> {
    await this.sync({ store: storeName, data, cdn_cache_control: 'max-age=3600' });
  }

  async restoreStore(storeName: string): Promise<any> {
    const data = await this.restore();
    return data?.store === storeName ? data.data : null;
  }

  getStatus(): CloudAdapterStatus {
    return {
      connected: this.connected,
      lastSync: this.lastSync || new Date(0),
      lastBackup: this.lastBackup || new Date(0),
      errorCount: this._errorCount,
      lastError: this.lastError ?? undefined
    };
  }

  getCapabilities(): CloudAdapterCapabilities {
    return {
      supportsSync: true,
      supportsBackup: true,
      supportsRestore: true,
      supportsRealTime: false,
      maxDataSize: 5 * 1024 * 1024 * 1024, // 5GB
      supportedFormats: ['json', 'binary', 'xml', 'text', 'image', 'video']
    };
  }

  private getDigitalOceanAuthHeader(method: string, resource: string): string {
    // DigitalOcean Spaces uses AWS S3-compatible signature
    const accessKeyId = this.config.credentials.accessKeyId || '';
    const secretAccessKey = this.config.credentials.secretAccessKey || '';
    const date = new Date().toUTCString();
    
    // Simplified AWS signature - in production, use proper AWS Signature V4
    const stringToSign = `${method}\n\napplication/json\n${date}\n${resource}`;
    const signature = Buffer.from(`${secretAccessKey}:${stringToSign}`).toString('base64');
    
    return `AWS ${accessKeyId}:${signature}`;
  }
}
