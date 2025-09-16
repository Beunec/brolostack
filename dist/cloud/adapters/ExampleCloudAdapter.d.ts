/**
 * Example Cloud Adapter
 * Demonstrates how to implement a cloud adapter for Brolostack
 *
 * This is a template that can be used to create adapters for:
 * - AWS (S3, DynamoDB)
 * - Google Cloud (Firebase, Firestore)
 * - Cloudflare (Workers, D1, R2)
 * - MongoDB Atlas
 * - Redis Cloud
 * - And more...
 */
import { CloudAdapter, CloudAdapterStatus, CloudAdapterCapabilities } from '../types';
export interface ExampleCloudConfig {
    apiKey: string;
    endpoint: string;
    region?: string;
    bucket?: string;
}
export declare class ExampleCloudAdapter implements CloudAdapter {
    readonly name: string;
    readonly provider: string;
    private config?;
    private connected;
    private status;
    /**
     * Connect to the cloud service
     */
    connect(config: ExampleCloudConfig): Promise<void>;
    /**
     * Disconnect from the cloud service
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected to the cloud service
     */
    isConnected(): boolean;
    /**
     * Sync data to the cloud service
     */
    sync(data: any): Promise<void>;
    /**
     * Backup data to the cloud service
     */
    backup(data: any): Promise<void>;
    /**
     * Restore data from the cloud service
     */
    restore(): Promise<any>;
    /**
     * Sync a specific store to the cloud
     */
    syncStore(storeName: string, data: any): Promise<void>;
    /**
     * Restore a specific store from the cloud
     */
    restoreStore(storeName: string): Promise<any>;
    /**
     * Get adapter status
     */
    getStatus(): CloudAdapterStatus;
    /**
     * Get adapter capabilities
     */
    getCapabilities(): CloudAdapterCapabilities;
    private simulateConnection;
    private simulateDisconnection;
    private simulateDataSync;
    private simulateBackup;
    private simulateDataRestore;
    private simulateStoreSync;
    private simulateStoreRestore;
}
//# sourceMappingURL=ExampleCloudAdapter.d.ts.map