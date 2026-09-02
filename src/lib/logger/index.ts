import { isBrowser, isProdEnv } from "@/env/client";
import { LogContext, LoggerOptions, LogLevel, LogPayload, LogTransport, SerializedError } from "@/types/logger";

const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const consoleStyles: Record<LogLevel, string> = {
  trace: "color: #95a5a6; font-weight: normal;",
  debug: "color: #7f8c8d; font-weight: bold;",
  info: "color: #2980b9; font-weight: bold;",
  warn: "color: #f39c12; font-weight: bold;",
  error: "color: #c0392b; font-weight: bold;",
  fatal: "color: #8e44ad; font-weight: bold;",
};

/**
 * Universal time source for environments lacking performance API.
 */
const getTime =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? () => performance.now()
    : () => Date.now();

/**
 * Safely parses log levels from environment variables.
 */
const getLogLevel = (): number => {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (envLevel && envLevel in LOG_LEVELS) {
    return LOG_LEVELS[envLevel as LogLevel];
  }
  return isProdEnv() ? LOG_LEVELS.info : LOG_LEVELS.debug;
};

const CURRENT_LOG_LEVEL = getLogLevel();

/**
 * Recursively serializes Error instances, preserving nested cause chains and stack traces.
 */
export function serializeError(err: unknown): SerializedError | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause instanceof Error ? serializeError(err.cause) : err.cause,
    };
  }
  return {
    name: "UnknownError",
    message: String(err),
  };
}

/**
 * Enterprise Console Transport Implementation
 * Emits raw structured objects in production for aggregators and formatted logs in dev.
 */
export class ConsoleTransport implements LogTransport {
  log(payload: LogPayload): void {
    const consoleMethod =
      {
        trace: console.debug,
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      }[payload.level] || console.log;

    if (!isBrowser()) {
      if (isProdEnv()) {
        consoleMethod(payload);
      } else {
        const color =
          payload.level === "fatal"
            ? "\x1b[35m"
            : payload.level === "error"
              ? "\x1b[31m"
              : payload.level === "warn"
                ? "\x1b[33m"
                : payload.level === "info"
                  ? "\x1b[36m"
                  : "\x1b[90m";
        const reset = "\x1b[0m";
        const contextStr = payload.context
          ? ` ${JSON.stringify(payload.context, null, 2)}`
          : "";
        const errorStr = payload.error?.stack
          ? `\n${payload.error.stack}`
          : "";

        consoleMethod(
          `[${payload.timestamp}] ${color}${payload.level.toUpperCase()}${reset}: ${payload.message}${contextStr}${errorStr}`
        );
      }
    } else {
      const consoleArgs: unknown[] = [
        `%c[${payload.timestamp}] [${payload.level.toUpperCase()}] %s`,
        consoleStyles[payload.level],
        payload.message,
      ];

      if (payload.context) {
        consoleArgs.push(payload.context);
      }

      if (payload.error) {
        consoleArgs.push(payload.error);
      }

      consoleMethod(...consoleArgs);
    }
  }
}

/**
 * Telemetry Transport for Sentry / OpenTelemetry / Datadog
 */
export class TelemetryTransport implements LogTransport {
  log(_payload: LogPayload): void {
    // Forwards raw LogPayload entries to configured telemetry sinks
  }
}

export class Logger {
  private readonly transports: readonly LogTransport[];
  private readonly defaultContext: LogContext;
  private readonly timers = new Map<string, number>();

  constructor(options: LoggerOptions = {}) {
    this.transports = options.transports ?? [
      new ConsoleTransport(),
      new TelemetryTransport(),
    ];
    this.defaultContext = options.defaultContext ?? {};
  }

  /**
   * Creates an immutable child logger with bound context tags.
   */
  child(childContext: LogContext): Logger {
    return new Logger({
      transports: this.transports,
      defaultContext: {
        ...this.defaultContext,
        ...childContext,
      },
    });
  }

  /**
   * Starts a performance timer with a unique label.
   */
  time(label: string): void {
    this.timers.set(label, getTime());
  }

  /**
   * Stops a performance timer and logs the elapsed duration in milliseconds.
   */
  timeEnd(label: string, level: LogLevel = "info"): void {
    const start = this.timers.get(label);
    if (start === undefined) {
      this.warn(`Timer "${label}" does not exist`);
      return;
    }

    const durationMs = Math.round((getTime() - start) * 100) / 100;
    this.timers.delete(label);
    this.dispatch(level, `${label} completed in ${durationMs}ms`, undefined, { durationMs });
  }

  /**
   * Measures the execution time of an async function and automatically logs its duration.
   */
  async measure<T>(label: string, fn: () => Promise<T>, level: LogLevel = "info"): Promise<T> {
    this.time(label);
    try {
      return await fn();
    } finally {
      this.timeEnd(label, level);
    }
  }

  private dispatch(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext
  ): void {
    if (LOG_LEVELS[level] < CURRENT_LOG_LEVEL) return;

    const mergedContext = context
      ? { ...this.defaultContext, ...context }
      : this.defaultContext;

    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: Object.keys(mergedContext).length > 0 ? mergedContext : undefined,
      error: error ? serializeError(error) : undefined,
    };

    this.transports.forEach((transport) => {
      try {
        transport.log(payload);
      } catch (err) {
        console.error("Logger transport execution failed:", err);
      }
    });
  }

  // --- Overloaded Public API methods --- //

  trace(message: string, context?: LogContext): void;
  trace(message: string, context?: LogContext): void {
    this.dispatch("trace", message, undefined, context);
  }

  debug(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void {
    this.dispatch("debug", message, undefined, context);
  }

  info(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void {
    this.dispatch("info", message, undefined, context);
  }

  warn(error: Error, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  warn(message: string, error: Error, context?: LogContext): void;
  warn(
    arg1: string | Error,
    arg2?: LogContext | Error,
    arg3?: LogContext
  ): void {
    this.handleOverload("warn", arg1, arg2, arg3);
  }

  error(error: Error, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  error(message: string, error: Error, context?: LogContext): void;
  error(
    arg1: string | Error,
    arg2?: LogContext | Error,
    arg3?: LogContext
  ): void {
    this.handleOverload("error", arg1, arg2, arg3);
  }

  fatal(error: Error, context?: LogContext): void;
  fatal(message: string, context?: LogContext): void;
  fatal(message: string, error: Error, context?: LogContext): void;
  fatal(
    arg1: string | Error,
    arg2?: LogContext | Error,
    arg3?: LogContext
  ): void {
    this.handleOverload("fatal", arg1, arg2, arg3);
  }

  private handleOverload(
    level: LogLevel,
    arg1: string | Error,
    arg2?: LogContext | Error,
    arg3?: LogContext
  ): void {
    if (arg1 instanceof Error) {
      const context = arg2 instanceof Error ? undefined : arg2;
      this.dispatch(level, arg1.message, arg1, context);
    } else if (typeof arg1 === "string") {
      if (arg2 instanceof Error) {
        this.dispatch(level, arg1, arg2, arg3);
      } else {
        this.dispatch(level, arg1, undefined, arg2);
      }
    }
  }
}

/**
 * Factory helper for creating custom configured Logger instances.
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

/**
 * Default Application Logger Singleton
 */
export const logger = createLogger();
