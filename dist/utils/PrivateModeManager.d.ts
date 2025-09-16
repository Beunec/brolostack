/**
 * Private Mode Manager
 * Handles private/incognito mode detection and management across all browsers
 */
export interface PrivateModeInfo {
    isPrivateMode: boolean;
    browser: string;
    storageMethod: 'localStorage' | 'sessionStorage' | 'memory' | 'indexedDB';
    limitations: string[];
    recommendations: string[];
}
export declare class PrivateModeManager {
    private static instance;
    private privateModeInfo;
    private constructor();
    static getInstance(): PrivateModeManager;
    /**
     * Detect private mode across all browsers
     */
    detectPrivateMode(): PrivateModeInfo;
    /**
     * Test if sessionStorage works
     */
    private testSessionStorage;
    /**
     * Test if IndexedDB works
     */
    private testIndexedDB;
    /**
     * Get storage recommendations for private mode
     */
    getStorageRecommendations(): string[];
    /**
     * Get private mode limitations
     */
    getLimitations(): string[];
    /**
     * Check if private mode is active
     */
    isPrivateMode(): boolean;
    /**
     * Get recommended storage method
     */
    getRecommendedStorageMethod(): string;
    /**
     * Get private mode information for logging
     */
    getPrivateModeInfo(): {
        browser: string;
        isPrivateMode: boolean;
        storageMethod: string;
        limitations?: string[];
        recommendations?: string[];
    };
    /**
     * Get private mode status for UI
     */
    getPrivateModeStatus(): {
        isPrivate: boolean;
        message: string;
        icon: string;
        color: string;
    };
    /**
     * Create storage adapter for private mode
     */
    createPrivateModeStorageAdapter(config: any): Promise<import("../storage/PrivateModeStorageAdapter").PrivateModeStorageAdapter> | Promise<import("../storage/LocalStorageAdapter").LocalStorageAdapter>;
}
export declare const privateModeManager: PrivateModeManager;
//# sourceMappingURL=PrivateModeManager.d.ts.map