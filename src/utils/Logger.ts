/**
 * Brolostack - Logger Utility
 * Simple logging utility for the framework
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(debug: boolean = false, prefix: string = 'Brolostack') {
    this.level = debug ? LogLevel.DEBUG : LogLevel.INFO;
    this.prefix = prefix;
  }

  debug(message: string, data?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[${this.prefix}] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[${this.prefix}] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[${this.prefix}] ${message}`, data || '');
    }
  }

  error(message: string, data?: any): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[${this.prefix}] ${message}`, data || '');
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }
}
