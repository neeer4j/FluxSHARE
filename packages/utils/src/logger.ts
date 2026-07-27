export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  readonly context: string;
  readonly minLevel?: LogLevel;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Structured logger with context tagging and level filtering.
 */
export class Logger {
  private readonly context: string;
  private minLevel: LogLevel;

  constructor(options: LoggerOptions) {
    this.context = options.context;
    this.minLevel = options.minLevel ?? 'info';
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  public error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error ?? '', ...args);
    }
  }
}

/**
 * Helper to instantiate a logger for a specific module context.
 */
export function createLogger(context: string, minLevel: LogLevel = 'info'): Logger {
  return new Logger({ context, minLevel });
}
