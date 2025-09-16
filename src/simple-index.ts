/**
 * Brolostack - Simple Entry Point
 * A Revolutionary, Zero-Cost Full-Stack Package Framework
 * 
 * This now uses the unified core implementation with simplified configuration
 */

// Export the unified core as the simple version
import { Brolostack } from './core/Brolostack';
export { Brolostack as SimpleBrolostack };
export default Brolostack;

// Export simplified types that map to the full implementation
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
