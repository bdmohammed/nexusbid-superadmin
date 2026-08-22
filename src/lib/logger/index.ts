type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const styles = {
  debug: "color: #888888; font-weight: bold;",
  info: "color: #0070f3; font-weight: bold;",
  warn: "color: #f5a623; font-weight: bold;",
  error: "color: #ff0000; font-weight: bold;",
};

const isServer = typeof window === "undefined";
const isProd = process.env.NODE_ENV === "production";

const getLogLevel = (): number => {
  const envLevel =
    process.env.NEXT_PUBLIC_LOG_LEVEL || (isProd ? "info" : "debug");
  return LOG_LEVELS[envLevel as LogLevel] ?? 1;
};

/**
 * Internal helper to handle remote logging requests (e.g. Sentry/Datadog).
 */
const sendToTelemetry = (payload: any): void => {
  // In a real application, integration with monitoring services goes here:
  // e.g. Sentry.captureException(payload.error, { extra: payload });
  // For now we will write a production-safe structured console stream output.
  try {
    const serialized = payload;
    // Under production containers, stdout JSON is consumed by Fluentbit/Logstash/Datadog Agent
    console.error(serialized);
  } catch {
    // Avoid letting telemetry failure crash the host application
    console.error("Failed to serialize log telemetry payload");
  }
};

const formatMessage = (level: LogLevel, message: string, context?: any) => {
  const timestamp = new Date().toISOString();
  if (isServer) {
    if (isProd) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        context,
      });
    }
    const color =
      level === "error"
        ? "\x1b[31m"
        : level === "warn"
          ? "\x1b[33m"
          : level === "info"
            ? "\x1b[36m"
            : "\x1b[90m";
    const reset = "\x1b[0m";
    const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : "";
    return `[${timestamp}] ${color}${level.toUpperCase()}${reset}: ${message}${contextStr}`;
  }
  return {
    timestamp,
    level,
    message,
    context,
  };
};

const writeLog = (level: LogLevel, message: string, context?: any) => {
  if (LOG_LEVELS[level] < getLogLevel()) return;

  const formatted = formatMessage(level, message, context);

  if (isServer) {
    if (isProd) {
      return sendToTelemetry(formatted);
    }
    if (level === "error") {
      console.error(formatted);
    } else if (level === "warn") {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  } else {
    const f = formatted as {
      timestamp: string;
      level: LogLevel;
      message: string;
      context?: any;
    };

    const consoleArgs = [
      `%c[${f.timestamp}] [${f.level.toUpperCase()}] %s`,
      styles[f.level],
      f.message,
    ];

    if (f.context !== undefined) {
      consoleArgs.push(f.context);
    }

    if (f.level === "error") {
      console.error(...consoleArgs);
    } else if (f.level === "warn") {
      console.warn(...consoleArgs);
    } else if (f.level === "info") {
      console.info(...consoleArgs);
    } else {
      console.log(...consoleArgs);
    }
  }
};

export const logger = {
  debug: (message: string, context?: any) =>
    writeLog("debug", message, context),
  info: (message: string, context?: any) => writeLog("info", message, context),
  warn: (message: string, context?: any) => writeLog("warn", message, context),
  error: (message: string, context?: any) =>
    writeLog("error", message, context),
};
