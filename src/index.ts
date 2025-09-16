/**
 * Brolostack - Main Entry Point
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 */

// Core exports
export { Brolostack } from './core/Brolostack';

// Enhanced exports (optional features)
export { EnhancedBrolostack } from './core/EnhancedBrolostack';
export { SyncManager } from './sync/SyncManager';
export { EnhancedStorageAdapter } from './storage/EnhancedStorageAdapter';

// Cloud integration exports (optional features)
export { CloudBrolostack } from './cloud/CloudBrolostack';
export { CloudSyncManager } from './cloud/CloudSyncManager';
export * from './cloud/types';

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

// React integration (if React is available)
export { BrolostackProvider, useBrolostack, useBrolostackStore } from './react/BrolostackProvider';

// Default export
import { Brolostack } from './core/Brolostack';
export { Brolostack as default };
