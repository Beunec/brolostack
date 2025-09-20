/**
 * Brolostack - React Integration
 * React provider and hooks for Brolostack
 */
import { ReactNode } from 'react';
import { BrolostackStore, BrolostackConfig, BrolostackContextValue } from '../types';
export interface BrolostackProviderProps {
    appName: string;
    config?: Partial<BrolostackConfig>;
    children: ReactNode;
    initialData?: Record<string, any>;
    ssrMode?: 'ssr' | 'ssg' | 'hybrid' | 'client';
    hydrationStrategy?: 'immediate' | 'lazy' | 'on-demand';
}
export declare function BrolostackProvider({ appName, config, children, initialData, ssrMode, hydrationStrategy }: BrolostackProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useBrolostack(): BrolostackContextValue;
export declare function useBrolostackStore<T>(storeName: string): BrolostackStore<T>;
export declare function useBrolostackState<T>(storeName: string, selector?: (state: T) => any): any;
/**
 * Hook to access authentication features
 */
export declare function useBrolostackAuth(): any;
/**
 * Hook to access real-time features
 */
export declare function useBrolostackRealtime(): any;
/**
 * Hook to access MRM (Multi-Rendering Mode) features
 */
export declare function useBrolostackMRM(): any;
/**
 * Hook to access security features
 */
export declare function useBrolostackSecurity(): any;
/**
 * Hook to access provider management
 */
export declare function useBrolostackProviders(): any;
/**
 * Hook to access cloud integration
 */
export declare function useBrolostackCloud(): any;
/**
 * Hook to check enterprise feature availability
 */
export declare function useBrolostackEnterprise(): {
    isEnabled: any;
    status: any;
    features: {
        auth: boolean;
        realtime: boolean;
        mrm: boolean;
        worker: boolean;
        security: boolean;
        providers: boolean;
        cloud: boolean;
    };
};
//# sourceMappingURL=BrolostackProvider.d.ts.map