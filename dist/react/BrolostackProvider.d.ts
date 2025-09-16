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
}
export declare function BrolostackProvider({ appName, config, children }: BrolostackProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useBrolostack(): BrolostackContextValue;
export declare function useBrolostackStore<T>(storeName: string): BrolostackStore<T>;
export declare function useBrolostackState<T>(storeName: string, selector?: (state: T) => any): any;
//# sourceMappingURL=BrolostackProvider.d.ts.map