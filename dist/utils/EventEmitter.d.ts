/**
 * Brolostack - Event Emitter Utility
 * Simple event emitter for the framework
 */
export declare class EventEmitter {
    private events;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    once(event: string, listener: (...args: any[]) => void): void;
    removeAllListeners(event?: string): void;
    listenerCount(event: string): number;
    eventNames(): string[];
}
//# sourceMappingURL=EventEmitter.d.ts.map