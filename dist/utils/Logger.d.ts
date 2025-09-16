/**
 * Brolostack - Logger Utility
 * Simple logging utility for the framework
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class Logger {
    private level;
    private prefix;
    constructor(debug?: boolean, prefix?: string);
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    setLevel(level: LogLevel): void;
    setPrefix(prefix: string): void;
}
//# sourceMappingURL=Logger.d.ts.map