/**
 * Private Mode Manager
 * Handles private/incognito mode detection and management across all browsers
 */

import { browserCompatibility } from './BrowserCompatibility';

export interface PrivateModeInfo {
  isPrivateMode: boolean;
  browser: string;
  storageMethod: 'localStorage' | 'sessionStorage' | 'memory' | 'indexedDB';
  limitations: string[];
  recommendations: string[];
}

export class PrivateModeManager {
  private static instance: PrivateModeManager;
  private privateModeInfo: PrivateModeInfo | null = null;

  private constructor() {}

  static getInstance(): PrivateModeManager {
    if (!PrivateModeManager.instance) {
      PrivateModeManager.instance = new PrivateModeManager();
    }
    return PrivateModeManager.instance;
  }

  /**
   * Detect private mode across all browsers
   */
  detectPrivateMode(): PrivateModeInfo {
    if (this.privateModeInfo) {
      return this.privateModeInfo;
    }

    const browserInfo = browserCompatibility.generateReport();
    const isPrivateMode = browserInfo.browser.features.privateMode;
    const browser = browserInfo.browser.name;
    
    let storageMethod: PrivateModeInfo['storageMethod'] = 'localStorage';
    const limitations: string[] = [];
    const recommendations: string[] = [];

    if (isPrivateMode) {
      // Determine best storage method for private mode
      if (this.testSessionStorage()) {
        storageMethod = 'sessionStorage';
        recommendations.push('Using sessionStorage for private mode compatibility');
      } else if (this.testIndexedDB()) {
        storageMethod = 'indexedDB';
        recommendations.push('Using IndexedDB for private mode compatibility');
      } else {
        storageMethod = 'memory';
        recommendations.push('Using memory storage - data will be lost on page refresh');
      }

      // Browser-specific limitations
      switch (browser) {
        case 'Chrome':
          limitations.push('localStorage disabled', 'IndexedDB limited', 'Cookies blocked');
          recommendations.push('Use sessionStorage or memory storage');
          break;
        case 'Firefox':
          limitations.push('localStorage disabled', 'IndexedDB limited', 'Cookies blocked');
          recommendations.push('Use sessionStorage or memory storage');
          break;
        case 'Safari':
          limitations.push('localStorage disabled', 'IndexedDB limited', 'Cookies blocked');
          recommendations.push('Use sessionStorage or memory storage');
          break;
        case 'Edge':
          limitations.push('localStorage disabled', 'IndexedDB limited', 'Cookies blocked');
          recommendations.push('Use sessionStorage or memory storage');
          break;
        case 'Brave':
          limitations.push('localStorage disabled', 'IndexedDB limited', 'Cookies blocked');
          recommendations.push('Use sessionStorage or memory storage');
          break;
        case 'DuckDuckGo':
          limitations.push('localStorage disabled', 'IndexedDB limited', 'Cookies blocked');
          recommendations.push('Use sessionStorage or memory storage');
          break;
        case 'Opera':
          limitations.push('localStorage disabled', 'IndexedDB limited', 'Cookies blocked');
          recommendations.push('Use sessionStorage or memory storage');
          break;
      }
    } else {
      // Normal mode - use best available storage
      if (browserInfo.browser.features.indexedDB) {
        storageMethod = 'indexedDB';
      } else if (browserInfo.browser.features.localStorage) {
        storageMethod = 'localStorage';
      } else {
        storageMethod = 'memory';
      }
    }

    this.privateModeInfo = {
      isPrivateMode,
      browser,
      storageMethod,
      limitations,
      recommendations
    };

    return this.privateModeInfo;
  }

  /**
   * Test if sessionStorage works
   */
  private testSessionStorage(): boolean {
    try {
      const test = 'brolostack-session-test';
      sessionStorage.setItem(test, 'test');
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test if IndexedDB works
   */
  private testIndexedDB(): boolean {
    try {
      return 'indexedDB' in window && 'IDBTransaction' in window;
    } catch {
      return false;
    }
  }

  /**
   * Get storage recommendations for private mode
   */
  getStorageRecommendations(): string[] {
    const info = this.detectPrivateMode();
    return info.recommendations;
  }

  /**
   * Get private mode limitations
   */
  getLimitations(): string[] {
    const info = this.detectPrivateMode();
    return info.limitations;
  }

  /**
   * Check if private mode is active
   */
  isPrivateMode(): boolean {
    const info = this.detectPrivateMode();
    return info.isPrivateMode;
  }

  /**
   * Get recommended storage method
   */
  getRecommendedStorageMethod(): string {
    const info = this.detectPrivateMode();
    return info.storageMethod;
  }

  /**
   * Get private mode information for logging
   */
  getPrivateModeInfo(): {
    browser: string;
    isPrivateMode: boolean;
    storageMethod: string;
    limitations?: string[];
    recommendations?: string[];
  } {
    const info = this.detectPrivateMode();
    
    return {
      browser: info.browser,
      isPrivateMode: info.isPrivateMode,
      storageMethod: info.storageMethod,
      ...(info.isPrivateMode && info.limitations && { limitations: info.limitations }),
      ...(info.isPrivateMode && info.recommendations && { recommendations: info.recommendations })
    };
  }

  /**
   * Get private mode status for UI
   */
  getPrivateModeStatus(): {
    isPrivate: boolean;
    message: string;
    icon: string;
    color: string;
  } {
    const info = this.detectPrivateMode();
    
    if (info.isPrivateMode) {
      return {
        isPrivate: true,
        message: `Private mode detected in ${info.browser}. Using ${info.storageMethod} storage.`,
        icon: '🔒',
        color: '#ff6b6b'
      };
    } else {
      return {
        isPrivate: false,
        message: `Normal mode in ${info.browser}. Full storage available.`,
        icon: '🌐',
        color: '#51cf66'
      };
    }
  }

  /**
   * Create storage adapter for private mode
   */
  createPrivateModeStorageAdapter(config: any) {
    const info = this.detectPrivateMode();
    
    if (info.isPrivateMode) {
      // Import the PrivateModeStorageAdapter dynamically to avoid circular dependencies
      return import('../storage/PrivateModeStorageAdapter').then(module => {
        return new module.PrivateModeStorageAdapter(config);
      });
    } else {
      // Use normal storage adapter
      return import('../storage/LocalStorageAdapter').then(module => {
        return new module.LocalStorageAdapter(config);
      });
    }
  }
}

// Export singleton instance
export const privateModeManager = PrivateModeManager.getInstance();
