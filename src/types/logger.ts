export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  readonly requestId?: string | undefined;
  readonly traceId?: string | undefined;
  readonly userId?: string | undefined;
  readonly sessionId?: string | undefined;
  readonly feature?: string | undefined;
  readonly durationMs?: number | undefined;
  readonly [key: string]: unknown;
}

export interface SerializedError {
  readonly name: string;
  readonly message: string;
  readonly stack?: string | undefined;
  readonly cause?: SerializedError | unknown | undefined;
}

export interface LogPayload {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context?: LogContext | undefined;
  readonly error?: SerializedError | undefined;
}

export interface LogTransport {
  log(payload: LogPayload): void;
}

export interface LoggerOptions {
  readonly transports?: readonly LogTransport[] | undefined;
  readonly defaultContext?: LogContext | undefined;
}
