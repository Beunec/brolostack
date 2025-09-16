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
export declare class BrowserCompatibility {
    private static instance;
    private browserInfo;
    private constructor();
    static getInstance(): BrowserCompatibility;
    /**
     * Detect browser and check compatibility
     */
    detectBrowser(): BrowserInfo;
    /**
     * Check if browser is supported
     */
    isBrowserSupported(browserName: string, version: string): boolean;
    /**
     * Check browser features
     */
    private checkFeatures;
    private checkLocalStorage;
    private checkIndexedDB;
    private checkWebSQL;
    private checkNavigator;
    private checkWindow;
    private checkPromises;
    private checkAsyncAwait;
    private checkES6Modules;
    private checkPrivateMode;
    private checkBraveShields;
    private checkDuckDuckGoPrivacy;
    /**
     * Generate compatibility report
     */
    generateReport(): CompatibilityReport;
    /**
     * Get storage driver priority based on browser support
     */
    getStorageDriverPriority(): string[];
    /**
     * Check if enhanced features are supported
     */
    isEnhancedFeaturesSupported(): boolean;
    private extractVersion;
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
    };
}
export declare const browserCompatibility: BrowserCompatibility;
//# sourceMappingURL=BrowserCompatibility.d.ts.map