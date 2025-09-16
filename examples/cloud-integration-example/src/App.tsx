import React, { useState, useEffect } from 'react';
import { CloudBrolostack } from '../../../src/cloud/CloudBrolostack';
import { CloudBrolostackConfig } from '../../../src/cloud/CloudBrolostack';

interface AppState {
  message: string;
  cloudStatus: string;
  syncStatus: string;
  lastSync?: Date;
  cloudAdapters: Array<{
    name: string;
    provider: string;
    connected: boolean;
  }>;
}

const CloudIntegrationApp: React.FC = () => {
  const [app, setApp] = useState<CloudBrolostack | null>(null);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('Hello from Cloud Brolostack!');
  const [cloudStatus, setCloudStatus] = useState('Initializing...');
  const [syncStatus, setSyncStatus] = useState('Not synced');
  const [lastSync, setLastSync] = useState<Date | undefined>();
  const [cloudAdapters, setCloudAdapters] = useState<AppState['cloudAdapters']>([]);

  useEffect(() => {
    // Initialize CloudBrolostack with example configuration
    const config: CloudBrolostackConfig = {
      appName: 'cloud-integration-example',
      version: '1.0.0',
      debug: true,
      
      // Enhanced features
      sync: {
        enabled: true,
        serverUrl: 'https://api.example.com',
        apiKey: 'demo-api-key',
        syncInterval: 30000,
        conflictResolution: 'client-wins'
      },
      
      backup: {
        enabled: true,
        autoBackup: true,
        backupInterval: 300000, // 5 minutes
        maxBackups: 10
      },
      
      // Cloud features (optional)
      cloud: {
        enabled: true,
        adapters: [
          {
            name: 'example-cloud',
            provider: 'example',
            config: {
              apiKey: 'demo-cloud-key',
              endpoint: 'https://api.example-cloud.com',
              region: 'us-east-1'
            },
            enabled: true,
            priority: 1
          }
        ],
        syncStrategy: 'local-first',
        conflictResolution: 'client-wins',
        autoSync: true,
        syncInterval: 60000 // 1 minute
      }
    };

    const cloudApp = new CloudBrolostack(config);
    setApp(cloudApp);

    // Initialize app state
    const store = cloudApp.createStore<AppState>('appState', {
      message: 'Hello from Cloud Brolostack!',
      cloudStatus: 'Initializing...',
      syncStatus: 'Not synced',
      cloudAdapters: []
    });

    // Set up event listeners
    cloudApp.on('store-updated', (storeName: string, data: any) => {
      if (storeName === 'appState') {
        setMessage(data.message);
        setCloudStatus(data.cloudStatus);
        setSyncStatus(data.syncStatus);
        setLastSync(data.lastSync);
        setCloudAdapters(data.cloudAdapters);
      }
    });

    // Update cloud status
    const updateCloudStatus = () => {
      const status = cloudApp.getCloudStatus();
      const cloudStatusText = status.enabled 
        ? `Cloud enabled with ${status.adapters.length} adapters`
        : 'Cloud disabled';
      
      store.setState({
        cloudStatus: cloudStatusText,
        cloudAdapters: status.adapters
      });
    };

    // Initial status update
    updateCloudStatus();

    // Set up periodic status updates
    const statusInterval = setInterval(updateCloudStatus, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const handleStoreMessage = async () => {
    if (!app) return;

    const store = app.getStore('appState');
    if (store) {
      store.setState({ message: input });
      setInput('');
      
      // Auto-sync to cloud if enabled
      if (app.isCloudEnabled()) {
        try {
          await app.syncToCloud('appState');
          store.setState({ 
            syncStatus: 'Synced to cloud',
            lastSync: new Date()
          });
        } catch (error) {
          store.setState({ 
            syncStatus: `Sync failed: ${error}`,
            lastSync: new Date()
          });
        }
      }
    }
  };

  const handleManualSync = async () => {
    if (!app) return;

    try {
      await app.syncToCloud();
      const store = app.getStore('appState');
      if (store) {
        store.setState({ 
          syncStatus: 'Manual sync completed',
          lastSync: new Date()
        });
      }
    } catch (error) {
      const store = app.getStore('appState');
      if (store) {
        store.setState({ 
          syncStatus: `Manual sync failed: ${error}`,
          lastSync: new Date()
        });
      }
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!app) return;

    try {
      await app.restoreFromCloud('appState');
      const store = app.getStore('appState');
      if (store) {
        store.setState({ 
          syncStatus: 'Restored from cloud',
          lastSync: new Date()
        });
      }
    } catch (error) {
      const store = app.getStore('appState');
      if (store) {
        store.setState({ 
          syncStatus: `Restore failed: ${error}`,
          lastSync: new Date()
        });
      }
    }
  };

  const handleBackupToCloud = async () => {
    if (!app) return;

    try {
      await app.backupToCloud();
      const store = app.getStore('appState');
      if (store) {
        store.setState({ 
          syncStatus: 'Backup completed',
          lastSync: new Date()
        });
      }
    } catch (error) {
      const store = app.getStore('appState');
      if (store) {
        store.setState({ 
          syncStatus: `Backup failed: ${error}`,
          lastSync: new Date()
        });
      }
    }
  };

  const handleToggleCloudSync = () => {
    if (!app) return;

    try {
      if (app.cloudSync?.isEnabled()) {
        app.disableCloudSync();
      } else {
        app.enableCloudSync();
      }
    } catch (error) {
      console.error('Failed to toggle cloud sync:', error);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🌐 Brolostack Cloud Integration Example</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Cloud Status</h2>
        <p><strong>Status:</strong> {cloudStatus}</p>
        <p><strong>Sync Status:</strong> {syncStatus}</p>
        {lastSync && <p><strong>Last Sync:</strong> {lastSync.toLocaleString()}</p>}
        
        <h3>Cloud Adapters</h3>
        {cloudAdapters.length > 0 ? (
          <ul>
            {cloudAdapters.map((adapter, index) => (
              <li key={index}>
                <strong>{adapter.name}</strong> ({adapter.provider}) - 
                <span style={{ color: adapter.connected ? 'green' : 'red' }}>
                  {adapter.connected ? ' ✅ Connected' : ' ❌ Disconnected'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No cloud adapters configured</p>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Store Management</h2>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter message to store"
            style={{ 
              padding: '8px', 
              marginRight: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '300px'
            }}
          />
          <button 
            onClick={handleStoreMessage}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Store Message
          </button>
        </div>
        <p><strong>Current Message:</strong> {message}</p>
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Cloud Operations</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleManualSync}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Manual Sync
          </button>
          
          <button 
            onClick={handleRestoreFromCloud}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📥 Restore from Cloud
          </button>
          
          <button 
            onClick={handleBackupToCloud}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            💾 Backup to Cloud
          </button>
          
          <button 
            onClick={handleToggleCloudSync}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Toggle Auto-Sync
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#d1ecf1', 
        padding: '20px', 
        borderRadius: '8px'
      }}>
        <h2>How It Works</h2>
        <p>This example demonstrates Brolostack's cloud integration capabilities:</p>
        <ul>
          <li><strong>Local-First:</strong> Data is stored locally first, then synced to cloud</li>
          <li><strong>Optional Cloud:</strong> Cloud features are completely optional</li>
          <li><strong>Multiple Adapters:</strong> Support for multiple cloud providers</li>
          <li><strong>Auto-Sync:</strong> Automatic synchronization with configurable intervals</li>
          <li><strong>Manual Operations:</strong> Manual sync, backup, and restore operations</li>
          <li><strong>Conflict Resolution:</strong> Configurable conflict resolution strategies</li>
          <li><strong>Real-time Status:</strong> Live status updates for cloud adapters</li>
        </ul>
        
        <h3>Architecture Benefits</h3>
        <ul>
          <li>✅ <strong>Zero Breaking Changes:</strong> Existing Brolostack apps continue to work</li>
          <li>✅ <strong>Gradual Migration:</strong> Start local, add cloud when needed</li>
          <li>✅ <strong>Vendor Flexibility:</strong> Choose from multiple cloud providers</li>
          <li>✅ <strong>Cost Control:</strong> Pay only for cloud features you use</li>
          <li>✅ <strong>Performance:</strong> Local-first ensures fast performance</li>
        </ul>
      </div>
    </div>
  );
};

export default CloudIntegrationApp;
