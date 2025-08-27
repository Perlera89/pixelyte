import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private formatMessage(
    level: string,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';

    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      context: context || {},
    });
  }

  log(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context));
  }

  error(message: string, trace?: string, context?: LogContext) {
    const errorContext = {
      ...context,
      trace,
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  verbose(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('verbose', message, context));
    }
  }

  // Métodos específicos para diferentes tipos de logs
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ) {
    this.log(`${method} ${url} ${statusCode} - ${responseTime}ms`, {
      ...context,
      type: 'request',
      method,
      url,
      statusCode,
      responseTime,
    });
  }

  logError(error: Error, context?: LogContext) {
    this.error(error.message, error.stack, {
      ...context,
      type: 'error',
      errorName: error.name,
    });
  }

  logBusinessEvent(event: string, data: any, context?: LogContext) {
    this.log(`Business event: ${event}`, {
      ...context,
      type: 'business_event',
      event,
      data,
    });
  }

  logSecurityEvent(event: string, context?: LogContext) {
    this.warn(`Security event: ${event}`, {
      ...context,
      type: 'security_event',
      event,
    });
  }
}
