// Structured logging utility
// In production, integrate with services like Winston, Pino, or cloud logging

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private output(entry: LogEntry) {
    const logString = JSON.stringify(entry);
    
    switch (entry.level) {
      case "error":
        console.error(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }

    // TODO: In production, send to logging service
    // await sendToLoggingService(entry);
  }

  info(message: string, context?: Record<string, any>) {
    this.output(this.formatLog("info", message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    this.output(this.formatLog("warn", message, context));
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.output(this.formatLog("error", message, context, error));
  }

  debug(message: string, context?: Record<string, any>) {
    this.output(this.formatLog("debug", message, context));
  }
}

export const logger = new Logger();

// Helper for API route error logging
export function logApiError(
  route: string,
  error: unknown,
  context?: Record<string, any>
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  logger.error(`API Error in ${route}`, errorObj, {
    route,
    ...context,
  });
}

