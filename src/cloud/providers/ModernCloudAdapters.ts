/**
 * Modern Cloud Adapters for Brolostack
 * Next-generation cloud service provider implementations
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
import { CloudProviderConfig } from './CloudProviderFactory';

// Tencent Cloud Adapter
export class TencentCloudAdapter extends EventEmitter implements CloudAdapter {
  name = 'tencent-cloud';
  provider = 'Tencent Cloud';
  
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
      throw new Error('Tencent Cloud adapter not connected');
    }

    try {
      // Tencent Cloud Object Storage (COS) sync
      const endpoint = `https://brolostack-${this.config.region || 'ap-beijing'}.cos.myqcloud.com/sync.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getTencentAuthHeader('PUT', '/sync.json'),
          'Content-Type': 'application/json',
          'Host': `brolostack-${this.config.region || 'ap-beijing'}.cos.myqcloud.com`
        },
        body: JSON.stringify({
          ...data,
          tencent_metadata: {
            region: this.config.region,
            timestamp: new Date().toISOString(),
            ai_integration: this.config.services?.ai || false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Tencent Cloud sync failed: ${response.statusText}`);
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
    const backupId = `tencent_backup_${Date.now()}`;
    
    try {
      const endpoint = `https://brolostack-backup-${this.config.region || 'ap-beijing'}.cos.myqcloud.com/${backupId}.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getTencentAuthHeader('PUT', `/${backupId}.json`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            provider: 'tencent-cloud',
            storage_class: 'STANDARD_IA'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Tencent Cloud backup failed: ${response.statusText}`);
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
    try {
      const endpoint = `https://brolostack-${this.config.region || 'ap-beijing'}.cos.myqcloud.com/sync.json`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': this.getTencentAuthHeader('GET', '/sync.json')
        }
      });

      if (!response.ok) {
        throw new Error(`Tencent Cloud restore failed: ${response.statusText}`);
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
    await this.sync({ store: storeName, data });
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
      maxDataSize: 5 * 1024 * 1024 * 1024, // 5GB
      supportedFormats: ['json', 'binary', 'xml', 'text']
    };
  }

  private getTencentAuthHeader(method: string, resource: string): string {
    const secretId = this.config.credentials.accessKeyId || '';
    const secretKey = this.config.credentials.secretAccessKey || '';
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Simplified Tencent Cloud signature
    const stringToSign = `${method}\n${resource}\n\nhost=brolostack.cos.myqcloud.com&timestamp=${timestamp}`;
    const signature = Buffer.from(`${secretKey}:${stringToSign}`).toString('base64');
    
    return `q-sign-algorithm=sha1&q-ak=${secretId}&q-sign-time=${timestamp};${timestamp + 3600}&q-key-time=${timestamp};${timestamp + 3600}&q-header-list=host&q-url-param-list=&q-signature=${signature}`;
  }
}

// VMware Cloud Adapter
export class VMwareCloudAdapter extends EventEmitter implements CloudAdapter {
  name = 'vmware-cloud';
  provider = 'VMware Cloud';
  
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
      throw new Error('VMware Cloud adapter not connected');
    }

    try {
      // VMware vCloud Director API sync
      const endpoint = `${this.config.endpoints?.storage || 'https://vcloud.vmware.com'}/api/brolostack/sync`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/*+json;version=36.0'
        },
        body: JSON.stringify({
          ...data,
          vmware_metadata: {
            org: this.config.credentials.tenantId,
            vdc: this.config.region,
            timestamp: new Date().toISOString(),
            vapp_integration: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`VMware Cloud sync failed: ${response.statusText}`);
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
    const backupId = `vmware_backup_${Date.now()}`;
    
    try {
      const endpoint = `${this.config.endpoints?.storage || 'https://vcloud.vmware.com'}/api/brolostack/backup`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/*+json;version=36.0'
        },
        body: JSON.stringify({
          name: backupId,
          data,
          backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            provider: 'vmware-cloud',
            snapshot_enabled: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`VMware Cloud backup failed: ${response.statusText}`);
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
    try {
      const endpoint = `${this.config.endpoints?.storage || 'https://vcloud.vmware.com'}/api/brolostack/sync`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Accept': 'application/*+json;version=36.0'
        }
      });

      if (!response.ok) {
        throw new Error(`VMware Cloud restore failed: ${response.statusText}`);
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
    await this.sync({ store: storeName, data, vmware_vapp: true });
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
      maxDataSize: 2 * 1024 * 1024 * 1024, // 2GB
      supportedFormats: ['json', 'binary', 'xml', 'ovf']
    };
  }
}

// Cloudflare Workers Adapter
export class CloudflareAdapter extends EventEmitter implements CloudAdapter {
  name = 'cloudflare';
  provider = 'Cloudflare';
  
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
      throw new Error('Cloudflare adapter not connected');
    }

    try {
      // Cloudflare KV storage sync
      const accountId = this.config.credentials.tenantId;
      const namespaceId = this.config.endpoints?.storage || 'brolostack_kv';
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/sync_data`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          cloudflare_metadata: {
            edge_cached: true,
            timestamp: new Date().toISOString(),
            worker_integration: this.config.services?.compute || false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Cloudflare sync failed: ${response.statusText}`);
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
    const backupId = `cf_backup_${Date.now()}`;
    
    try {
      const accountId = this.config.credentials.tenantId;
      const namespaceId = this.config.endpoints?.storage || 'brolostack_kv';
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${backupId}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            provider: 'cloudflare',
            edge_locations: 'global',
            ttl: 86400 * 365 // 1 year retention
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Cloudflare backup failed: ${response.statusText}`);
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
    try {
      const accountId = this.config.credentials.tenantId;
      const namespaceId = this.config.endpoints?.storage || 'brolostack_kv';
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/sync_data`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Cloudflare restore failed: ${response.statusText}`);
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
    await this.sync({ store: storeName, data, edge_cache_ttl: 3600 });
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
      supportsRealTime: true, // Cloudflare Workers support real-time
      maxDataSize: 25 * 1024 * 1024, // 25MB KV limit
      supportedFormats: ['json', 'binary', 'text']
    };
  }
}

// CoreWeave Adapter (High-Performance Computing Cloud)
export class CoreWeaveAdapter extends EventEmitter implements CloudAdapter {
  name = 'coreweave';
  provider = 'CoreWeave';
  
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
      throw new Error('CoreWeave adapter not connected');
    }

    try {
      // CoreWeave Object Storage (S3-compatible) sync
      const endpoint = `https://object.${this.config.region || 'ord1'}.coreweave.com/brolostack-sync/sync.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getCoreWeaveAuthHeader('PUT', '/brolostack-sync/sync.json'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          coreweave_metadata: {
            region: this.config.region,
            timestamp: new Date().toISOString(),
            gpu_accelerated: this.config.services?.ai || false,
            high_performance: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`CoreWeave sync failed: ${response.statusText}`);
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
    const backupId = `cw_backup_${Date.now()}`;
    
    try {
      const endpoint = `https://object.${this.config.region || 'ord1'}.coreweave.com/brolostack-backup/${backupId}.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getCoreWeaveAuthHeader('PUT', `/brolostack-backup/${backupId}.json`),
          'Content-Type': 'application/json',
          'x-amz-storage-class': 'STANDARD'
        },
        body: JSON.stringify({
          data,
          backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            provider: 'coreweave',
            gpu_optimized: true,
            performance_tier: 'high'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`CoreWeave backup failed: ${response.statusText}`);
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
    try {
      const endpoint = `https://object.${this.config.region || 'ord1'}.coreweave.com/brolostack-sync/sync.json`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': this.getCoreWeaveAuthHeader('GET', '/brolostack-sync/sync.json')
        }
      });

      if (!response.ok) {
        throw new Error(`CoreWeave restore failed: ${response.statusText}`);
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
    await this.sync({ store: storeName, data, gpu_accelerated: this.config.services?.ai });
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
      supportedFormats: ['json', 'binary', 'hdf5', 'parquet', 'tensor'] // AI/ML optimized formats
    };
  }

  private getCoreWeaveAuthHeader(method: string, resource: string): string {
    // CoreWeave uses S3-compatible authentication
    const accessKeyId = this.config.credentials.accessKeyId || '';
    const secretAccessKey = this.config.credentials.secretAccessKey || '';
    const date = new Date().toUTCString();
    
    const stringToSign = `${method}\n\napplication/json\n${date}\n${resource}`;
    const signature = Buffer.from(`${secretAccessKey}:${stringToSign}`).toString('base64');
    
    return `AWS ${accessKeyId}:${signature}`;
  }
}

// Huawei Cloud Adapter
export class HuaweiCloudAdapter extends EventEmitter implements CloudAdapter {
  name = 'huawei-cloud';
  provider = 'Huawei Cloud';
  
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
      throw new Error('Huawei Cloud adapter not connected');
    }

    try {
      // Huawei Cloud Object Storage Service (OBS) sync
      const endpoint = `https://brolostack.obs.${this.config.region || 'cn-north-1'}.myhuaweicloud.com/sync.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getHuaweiAuthHeader('PUT', '/sync.json'),
          'Content-Type': 'application/json',
          'Date': new Date().toUTCString()
        },
        body: JSON.stringify({
          ...data,
          huawei_metadata: {
            region: this.config.region,
            timestamp: new Date().toISOString(),
            ai_gallery_integration: this.config.services?.ai || false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Huawei Cloud sync failed: ${response.statusText}`);
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
    const backupId = `huawei_backup_${Date.now()}`;
    
    try {
      const endpoint = `https://brolostack-backup.obs.${this.config.region || 'cn-north-1'}.myhuaweicloud.com/${backupId}.json`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': this.getHuaweiAuthHeader('PUT', `/${backupId}.json`),
          'Content-Type': 'application/json',
          'Date': new Date().toUTCString()
        },
        body: JSON.stringify({
          data,
          backup_metadata: {
            backup_id: backupId,
            timestamp: new Date().toISOString(),
            provider: 'huawei-cloud',
            storage_class: 'WARM',
            compliance: 'china_data_protection'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Huawei Cloud backup failed: ${response.statusText}`);
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
    try {
      const endpoint = `https://brolostack.obs.${this.config.region || 'cn-north-1'}.myhuaweicloud.com/sync.json`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': this.getHuaweiAuthHeader('GET', '/sync.json'),
          'Date': new Date().toUTCString()
        }
      });

      if (!response.ok) {
        throw new Error(`Huawei Cloud restore failed: ${response.statusText}`);
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
    await this.sync({ store: storeName, data, compliance_check: true });
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
      maxDataSize: 5 * 1024 * 1024 * 1024, // 5GB
      supportedFormats: ['json', 'binary', 'xml', 'text']
    };
  }

  private getHuaweiAuthHeader(method: string, resource: string): string {
    // Huawei Cloud OBS signature
    const accessKeyId = this.config.credentials.accessKeyId || '';
    const secretAccessKey = this.config.credentials.secretAccessKey || '';
    const date = new Date().toUTCString();
    
    const stringToSign = `${method}\n\napplication/json\n${date}\n${resource}`;
    const signature = Buffer.from(`${secretAccessKey}:${stringToSign}`).toString('base64');
    
    return `OBS ${accessKeyId}:${signature}`;
  }
}
