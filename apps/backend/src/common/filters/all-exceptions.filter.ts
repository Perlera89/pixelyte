import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { LoggerService } from '../services/logger.service';
import { ErrorCodes } from '../enums/error-codes.enum';
import {
  ErrorResponseDto,
  PrismaErrorResponseDto,
  ValidationErrorResponseDto,
} from '../dto/error-response.dto';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    const path = request.url;

    let errorResponse: ErrorResponseDto;

    // Log context para todos los errores
    const logContext = {
      errorId,
      userId: (request as any).user?.id,
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      body: this.sanitizeRequestBody(request.body),
    };

    if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(
        exception,
        errorId,
        timestamp,
        path,
      );
    } else if (exception instanceof PrismaClientKnownRequestError) {
      errorResponse = this.handlePrismaKnownError(
        exception,
        errorId,
        timestamp,
        path,
      );
    } else if (exception instanceof PrismaClientValidationError) {
      errorResponse = this.handlePrismaValidationError(
        exception,
        errorId,
        timestamp,
        path,
      );
    } else {
      errorResponse = this.handleUnknownError(
        exception,
        errorId,
        timestamp,
        path,
      );
    }

    // Log del error
    this.logger.logError(
      exception instanceof Error ? exception : new Error(String(exception)),
      {
        ...logContext,
        errorResponse,
      },
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleHttpException(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;

      // Manejar errores de validación de class-validator
      if (
        status === HttpStatus.BAD_REQUEST &&
        Array.isArray(responseObj.message)
      ) {
        return this.createValidationErrorResponse(
          responseObj.message,
          status,
          errorId,
          timestamp,
          path,
        );
      }

      // Manejar excepciones de negocio personalizadas
      if (responseObj.code) {
        return {
          statusCode: status,
          message: responseObj.message || exception.message,
          code: responseObj.code,
          details: responseObj.details,
          timestamp,
          path,
          errorId,
        };
      }
    }

    // Error HTTP estándar
    return {
      statusCode: status,
      message: exception.message,
      code: this.getErrorCodeFromStatus(status),
      timestamp,
      path,
      errorId,
    };
  }

  private handlePrismaKnownError(
    exception: PrismaClientKnownRequestError,
    errorId: string,
    timestamp: string,
    path: string,
  ): PrismaErrorResponseDto {
    const { code, message, meta } = exception;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Database error occurred';
    let errorCode = ErrorCodes.DATABASE_ERROR;
    let field: string | undefined;

    switch (code) {
      case 'P2002': // Unique constraint violation
        statusCode = HttpStatus.CONFLICT;
        errorMessage = 'Resource already exists';
        errorCode = ErrorCodes.UNIQUE_CONSTRAINT_VIOLATION;
        field = this.extractFieldFromMeta(meta);
        break;

      case 'P2003': // Foreign key constraint violation
        statusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Invalid reference to related resource';
        errorCode = ErrorCodes.FOREIGN_KEY_CONSTRAINT_VIOLATION;
        field = this.extractFieldFromMeta(meta);
        break;

      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        errorMessage = 'Resource not found';
        errorCode = ErrorCodes.RECORD_NOT_FOUND;
        break;

      case 'P2014': // Required relation missing
        statusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Required related resource is missing';
        errorCode = ErrorCodes.VALIDATION_ERROR;
        break;

      default:
        // Log unknown Prisma errors for investigation
        this.logger.error(`Unknown Prisma error code: ${code}`, message, {
          prismaCode: code,
          prismaMeta: meta,
        });
    }

    return {
      statusCode,
      message: errorMessage,
      code: errorCode,
      prismaCode: code,
      field,
      timestamp,
      path,
      errorId,
    };
  }

  private handlePrismaValidationError(
    exception: PrismaClientValidationError,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid data provided',
      code: ErrorCodes.VALIDATION_ERROR,
      details: ['Database validation failed'],
      timestamp,
      path,
      errorId,
    };
  }

  private handleUnknownError(
    exception: unknown,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    // Log error completo para investigación
    this.logger.error('Unknown error occurred', String(exception), {
      errorType: typeof exception,
      errorConstructor: exception?.constructor?.name,
    });

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      errorId,
    };
  }

  private createValidationErrorResponse(
    validationErrors: string[],
    statusCode: number,
    errorId: string,
    timestamp: string,
    path: string,
  ): ValidationErrorResponseDto {
    // Procesar errores de validación para extraer errores por campo
    const fieldErrors: Record<string, string[]> = {};
    const details: string[] = [];

    validationErrors.forEach((error) => {
      if (typeof error === 'string') {
        details.push(error);
        // Intentar extraer el campo del mensaje de error
        const fieldMatch = error.match(/^(\w+)\s/);
        if (fieldMatch) {
          const field = fieldMatch[1];
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(error);
        }
      }
    });

    return {
      statusCode,
      message: 'Validation failed',
      code: ErrorCodes.VALIDATION_ERROR,
      details,
      fieldErrors:
        Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      timestamp,
      path,
      errorId,
    };
  }

  private getErrorCodeFromStatus(status: number): ErrorCodes {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCodes.INVALID_INPUT;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCodes.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCodes.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCodes.RESOURCE_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCodes.RESOURCE_CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCodes.RATE_LIMIT_EXCEEDED;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return ErrorCodes.INTERNAL_SERVER_ERROR;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCodes.SERVICE_UNAVAILABLE;
      default:
        return ErrorCodes.INTERNAL_SERVER_ERROR;
    }
  }

  private extractFieldFromMeta(meta: any): string | undefined {
    if (meta?.target && Array.isArray(meta.target)) {
      return meta.target[0];
    }
    if (meta?.field_name) {
      return meta.field_name;
    }
    return undefined;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
