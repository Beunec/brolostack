/**
 * Browser Compatibility Manager
 * Ensures Brolostack works across all modern browsers
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
  features: {
    localStorage: boolean;
    indexedDB: boolean;
    webSQL: boolean;
    navigator: boolean;
    window: boolean;
    promises: boolean;
    asyncAwait: boolean;
    es6Modules: boolean;
    privateMode: boolean;
    braveShields: boolean;
    duckDuckGoPrivacy: boolean;
  };
}

export interface CompatibilityReport {
  isCompatible: boolean;
  browser: BrowserInfo;
  missingFeatures: string[];
  fallbacks: string[];
  recommendations: string[];
}

export class BrowserCompatibility {
  private static instance: BrowserCompatibility;
  private browserInfo: BrowserInfo | null = null;

  private constructor() {}

  static getInstance(): BrowserCompatibility {
    if (!BrowserCompatibility.instance) {
      BrowserCompatibility.instance = new BrowserCompatibility();
    }
    return BrowserCompatibility.instance;
  }

  /**
   * Detect browser and check compatibility
   */
  detectBrowser(): BrowserInfo {
    if (this.browserInfo) {
      return this.browserInfo;
    }

    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = '0';

    // Detect browser
    if (userAgent.includes('DuckDuckGo')) {
      browserName = 'DuckDuckGo';
      browserVersion = this.extractVersion(userAgent, 'Chrome/');
    } else if (userAgent.includes('Brave')) {
      browserName = 'Brave';
      browserVersion = this.extractVersion(userAgent, 'Chrome/');
    } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browserName = 'Chrome';
      browserVersion = this.extractVersion(userAgent, 'Chrome/');
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      browserVersion = this.extractVersion(userAgent, 'Firefox/');
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browserName = 'Safari';
      browserVersion = this.extractVersion(userAgent, 'Version/');
    } else if (userAgent.includes('Edg')) {
      browserName = 'Edge';
      browserVersion = this.extractVersion(userAgent, 'Edg/');
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      browserName = 'Opera';
      browserVersion = this.extractVersion(userAgent, userAgent.includes('OPR') ? 'OPR/' : 'Opera/');
    }

    // Check feature support
    const features = this.checkFeatures();

    this.browserInfo = {
      name: browserName,
      version: browserVersion,
      isSupported: this.isBrowserSupported(browserName, browserVersion),
      features
    };

    return this.browserInfo;
  }

  /**
   * Check if browser is supported
   */
  isBrowserSupported(browserName: string, version: string): boolean {
    const versionNum = parseFloat(version);
    
    // Minimum supported versions
    const minVersions: Record<string, number> = {
      'Chrome': 60,       // 2017
      'Brave': 60,        // 2017 (based on Chromium)
      'DuckDuckGo': 60,   // 2017 (based on Chromium)
      'Firefox': 55,      // 2017
      'Safari': 12,       // 2018
      'Edge': 79,         // 2020 (Chromium-based)
      'Opera': 47         // 2017
    };

    const minVersion = minVersions[browserName];
    return minVersion ? versionNum >= minVersion : false;
  }

  /**
   * Check browser features
   */
  private checkFeatures() {
    return {
      localStorage: this.checkLocalStorage(),
      indexedDB: this.checkIndexedDB(),
      webSQL: this.checkWebSQL(),
      navigator: this.checkNavigator(),
      window: this.checkWindow(),
      promises: this.checkPromises(),
      asyncAwait: this.checkAsyncAwait(),
      es6Modules: this.checkES6Modules(),
      privateMode: this.checkPrivateMode(),
      braveShields: this.checkBraveShields(),
      duckDuckGoPrivacy: this.checkDuckDuckGoPrivacy()
    };
  }

  private checkLocalStorage(): boolean {
    try {
      const test = 'brolostack-test';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private checkIndexedDB(): boolean {
    return 'indexedDB' in window && 'IDBTransaction' in window;
  }

  private checkWebSQL(): boolean {
    return 'openDatabase' in window;
  }

  private checkNavigator(): boolean {
    return 'navigator' in window && 'onLine' in navigator;
  }

  private checkWindow(): boolean {
    return 'window' in globalThis && 'addEventListener' in window;
  }

  private checkPromises(): boolean {
    return 'Promise' in window && typeof Promise.resolve === 'function';
  }

  private checkAsyncAwait(): boolean {
    try {
      // Test async/await support
      eval('(async () => {})()');
      return true;
    } catch {
      return false;
    }
  }

  private checkES6Modules(): boolean {
    return 'import' in window || 'importScripts' in window;
  }

  private checkPrivateMode(): boolean {
    try {
      // Universal private mode detection for all browsers
      const test = 'brolostack-private-test';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return false; // Not in private mode
    } catch {
      return true; // Likely in private mode
    }
  }

  private checkBraveShields(): boolean {
    // Check if Brave shields are active
    if (this.browserInfo?.name === 'Brave') {
      // Brave-specific detection
      return !!(window as any).brave && !!(window as any).brave.isBrave;
    }
    return false;
  }

  private checkDuckDuckGoPrivacy(): boolean {
    // Check if DuckDuckGo privacy features are active
    if (this.browserInfo?.name === 'DuckDuckGo') {
      // DuckDuckGo-specific privacy detection
      return !!(window as any).duckduckgo && !!(window as any).duckduckgo.isDuckDuckGo;
    }
    return false;
  }

  /**
   * Generate compatibility report
   */
  generateReport(): CompatibilityReport {
    const browser = this.detectBrowser();
    const missingFeatures: string[] = [];
    const fallbacks: string[] = [];
    const recommendations: string[] = [];

    // Check missing features
    if (!browser.features.localStorage) {
      missingFeatures.push('localStorage');
      fallbacks.push('Memory storage');
    }

    if (!browser.features.indexedDB) {
      missingFeatures.push('indexedDB');
      fallbacks.push('localStorage fallback');
    }

    if (!browser.features.navigator) {
      missingFeatures.push('navigator');
      fallbacks.push('Offline mode only');
    }

    if (!browser.features.promises) {
      missingFeatures.push('Promises');
      recommendations.push('Update browser to support modern JavaScript');
    }

    if (!browser.features.asyncAwait) {
      missingFeatures.push('async/await');
      recommendations.push('Update browser to support ES2017+');
    }

    // Private mode recommendations for all browsers
    if (browser.features.privateMode) {
      recommendations.push('Private/Incognito mode detected - storage may be limited');
    }

    // Brave-specific recommendations
    if (browser.name === 'Brave' && browser.features.braveShields) {
      recommendations.push('Brave Shields detected - some features may be blocked');
    }

    // DuckDuckGo-specific recommendations
    if (browser.name === 'DuckDuckGo' && browser.features.duckDuckGoPrivacy) {
      recommendations.push('DuckDuckGo privacy features detected - enhanced privacy mode active');
    }

    // Determine overall compatibility
    const isCompatible = browser.isSupported && 
                        browser.features.localStorage && 
                        browser.features.promises;

    return {
      isCompatible,
      browser,
      missingFeatures,
      fallbacks,
      recommendations
    };
  }

  /**
   * Get storage driver priority based on browser support
   */
  getStorageDriverPriority(): string[] {
    const features = this.detectBrowser().features;
    const drivers: string[] = [];

    // Priority order based on performance and reliability
    if (features.indexedDB) {
      drivers.push('indexedDB');
    }
    
    if (features.localStorage) {
      drivers.push('localStorageWrapper');
    }
    
    if (features.webSQL) {
      drivers.push('webSQLStorage');
    }

    // Fallback to memory if nothing else works
    drivers.push('localforage');

    return drivers;
  }

  /**
   * Check if enhanced features are supported
   */
  isEnhancedFeaturesSupported(): boolean {
    const browser = this.detectBrowser();
    return browser.isSupported && 
           browser.features.navigator && 
           browser.features.window &&
           browser.features.promises;
  }

  private extractVersion(userAgent: string, prefix: string): string {
    const index = userAgent.indexOf(prefix);
    if (index === -1) return '0';
    
    const versionStart = index + prefix.length;
    const versionEnd = userAgent.indexOf('.', versionStart);
    const version = versionEnd !== -1 
      ? userAgent.substring(versionStart, versionEnd)
      : userAgent.substring(versionStart);
    
    return version || '0';
  }

  /**
   * Get compatibility information for logging
   */
  getCompatibilityInfo(): {
    browser: string;
    version: string;
    isCompatible: boolean;
    missingFeatures: string[];
    fallbacks: string[];
    storageDrivers: string[];
  } {
    const report = this.generateReport();
    const { browser, isCompatible, missingFeatures, fallbacks } = report;

    return {
      browser: `${browser.name} ${browser.version}`,
      version: browser.version,
      isCompatible,
      missingFeatures,
      fallbacks,
      storageDrivers: this.getStorageDriverPriority()
    };
  }
}

// Export singleton instance
export const browserCompatibility = BrowserCompatibility.getInstance();
