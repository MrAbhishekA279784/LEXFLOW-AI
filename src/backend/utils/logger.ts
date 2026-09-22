export interface LogContext {
  requestId?: string;
  userId?: string;
  documentId?: string;
  jobId?: string;
  durationMs?: number;
  operation?: string;
  [key: string]: any;
}

class Logger {
  private format(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    // Sanitize any potential secret keys or long text
    const safeContext = { ...context };
    delete safeContext.apiKey;
    delete safeContext.token;
    delete safeContext.fullText;
    delete safeContext.documentContent;

    return JSON.stringify({
      timestamp,
      level,
      message,
      ...safeContext,
    });
  }

  info(message: string, context?: LogContext): void {
    console.log(this.format('INFO', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.format('WARN', message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    console.error(
      this.format('ERROR', message, {
        ...context,
        errorMessage: error?.message || String(error),
        errorCode: error?.errorCode || 'UNKNOWN_ERROR',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      })
    );
  }

  async time<T>(operation: string, fn: () => Promise<T>, context?: LogContext): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.info(`[TIMING] ${operation} completed`, { ...context, operation, durationMs });
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      this.error(`[TIMING] ${operation} failed`, err, { ...context, operation, durationMs });
      throw err;
    }
  }
}

export const logger = new Logger();
