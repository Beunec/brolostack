/**
 * Private Mode Example
 * Demonstrates Brolostack's private mode and DuckDuckGo support
 */

// @ts-ignore
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { 
  privateModeManager, 
  PrivateModeStorageAdapter, 
  browserCompatibility 
} from '../../../src/index';

interface AppState {
  items: string[];
  newItem: string;
  privateModeStatus: any;
  browserInfo: any;
  storageMethod: string;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    items: [],
    newItem: '',
    privateModeStatus: null,
    browserInfo: null,
    storageMethod: 'unknown'
  });

  const [storage, setStorage] = useState<PrivateModeStorageAdapter | null>(null);

  useEffect(() => {
    // Initialize private mode detection
    const privateModeInfo = privateModeManager.detectPrivateMode();
    const browserReport = browserCompatibility.generateReport();
    
    // Create storage adapter
    const storageAdapter = new PrivateModeStorageAdapter({
      name: 'private-mode-example',
      version: 1,
      size: 50 * 1024 * 1024
    });

    setStorage(storageAdapter);
    setState(prev => ({
      ...prev,
      privateModeStatus: privateModeInfo,
      browserInfo: browserReport.browser,
      storageMethod: storageAdapter.getStorageMethod()
    }));

    // Load existing items
    loadItems(storageAdapter);
  }, []);

  const loadItems = async (storageAdapter: PrivateModeStorageAdapter) => {
    try {
      const keys = await storageAdapter.keys();
      const items: string[] = [];
      
      for (const key of keys) {
        if (key.startsWith('item_')) {
          const value = await storageAdapter.getItem(key);
          if (value) {
            items.push(value);
          }
        }
      }
      
      setState(prev => ({ ...prev, items }));
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  const addItem = async () => {
    if (!state.newItem.trim() || !storage) return;

    try {
      const key = `item_${Date.now()}`;
      await storage.setItem(key, state.newItem);
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, prev.newItem],
        newItem: ''
      }));
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const removeItem = async (index: number) => {
    if (!storage) return;

    try {
      const keys = await storage.keys();
      const itemKey = keys.find(key => key.startsWith('item_'));
      
      if (itemKey) {
        await storage.removeItem(itemKey);
        setState(prev => ({
          ...prev,
          items: prev.items.filter((_, i) => i !== index)
        }));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const exportData = async () => {
    if (!storage) return;

    try {
      const data = await storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brolostack-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !storage) return;

    try {
      const text = await file.text();
      const success = await storage.importData(text);
      
      if (success) {
        await loadItems(storage);
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data');
    }
  };

  const getStatusColor = () => {
    if (state.privateModeStatus?.isPrivateMode) {
      return '#ff6b6b'; // Red for private mode
    }
    return '#51cf66'; // Green for normal mode
  };

  const getStatusIcon = () => {
    if (state.privateModeStatus?.isPrivateMode) {
      return '🔒';
    }
    return '🌐';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔒 Brolostack Private Mode Example</h1>
      
      {/* Browser & Private Mode Status */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: `2px solid ${getStatusColor()}`
      }}>
        <h2 style={{ color: getStatusColor(), margin: '0 0 10px 0' }}>
          {getStatusIcon()} {state.privateModeStatus?.isPrivateMode ? 'Private Mode Active' : 'Normal Mode'}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong>Browser:</strong> {state.browserInfo?.name} {state.browserInfo?.version}
          </div>
          <div>
            <strong>Storage Method:</strong> {state.storageMethod}
          </div>
          <div>
            <strong>Private Mode:</strong> {state.privateModeStatus?.isPrivateMode ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Browser Support:</strong> {state.browserInfo?.isSupported ? 'Full' : 'Limited'}
          </div>
        </div>

        {state.privateModeStatus?.isPrivateMode && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
            <strong>⚠️ Private Mode Limitations:</strong>
            <ul style={{ margin: '5px 0 0 20px' }}>
              {state.privateModeStatus.limitations.map((limitation: string, index: number) => (
                <li key={index}>{limitation}</li>
              ))}
            </ul>
          </div>
        )}

        {state.privateModeStatus?.recommendations && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
            <strong>💡 Recommendations:</strong>
            <ul style={{ margin: '5px 0 0 20px' }}>
              {state.privateModeStatus.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* DuckDuckGo Detection */}
      {state.browserInfo?.name === 'DuckDuckGo' && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '2px solid #28a745'
        }}>
          <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>
            🦆 DuckDuckGo Browser Detected
          </h3>
          <p>Enhanced privacy features are active. Your data is protected with DuckDuckGo's privacy-first approach.</p>
        </div>
      )}

      {/* Item Management */}
      <div style={{ marginBottom: '20px' }}>
        <h2>📝 Item Management</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={state.newItem}
            onChange={(e) => setState(prev => ({ ...prev, newItem: e.target.value }))}
            placeholder="Enter new item..."
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px' 
            }}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <button
            onClick={addItem}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Item
          </button>
        </div>

        <div>
          <h3>Items ({state.items.length})</h3>
          {state.items.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No items yet. Add some items above!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {state.items.map((item, index) => (
                <li
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    margin: '5px 0',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeItem(index)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Data Export/Import */}
      <div style={{ marginBottom: '20px' }}>
        <h2>💾 Data Management</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={exportData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export Data
          </button>
          
          <label style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {state.privateModeStatus?.isPrivateMode && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
            <strong>💡 Private Mode Tip:</strong> In private mode, data is stored in sessionStorage or memory. 
            Use export/import to backup your data before closing the browser.
          </div>
        )}
      </div>

      {/* Storage Information */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🔧 Storage Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><strong>Storage Method:</strong> {state.storageMethod}</div>
          <div><strong>Private Mode:</strong> {state.privateModeStatus?.isPrivateMode ? 'Yes' : 'No'}</div>
          <div><strong>Browser:</strong> {state.browserInfo?.name} {state.browserInfo?.version}</div>
          <div><strong>Items Count:</strong> {state.items.length}</div>
        </div>
      </div>
    </div>
  );
}
