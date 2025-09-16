/**
 * Brolostack - Simple Entry Point
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 *
 * This now uses the unified core implementation with simplified configuration
 */
import { Brolostack } from './core/Brolostack';
export { Brolostack as SimpleBrolostack };
export default Brolostack;
export interface SimpleBrolostackConfig {
    appName: string;
    version: string;
    debug?: boolean;
}
export interface SimpleStore<T = any> {
    getState(): T;
    setState(partial: Partial<T>): void;
    subscribe(listener: (state: T) => void): () => void;
    persist(name: string): void;
    clear(): void;
}
//# sourceMappingURL=simple-index.d.ts.map