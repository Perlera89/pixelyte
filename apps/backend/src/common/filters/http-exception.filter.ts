import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { ErrorCodes } from '../enums/error-codes.enum';

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const timestamp = new Date().toISOString();
    const path = request.url;
    const errorId = this.generateErrorId();

    const logContext = {
      errorId,
      userId: (request as any).user?.id,
      method: request.method,
      url: request.url,
      statusCode: status,
    };

    let errorResponse: ErrorResponseDto;

    // Manejar diferentes tipos de errores HTTP
    if (status === HttpStatus.UNAUTHORIZED) {
      errorResponse = this.handleUnauthorizedError(
        exception,
        errorId,
        timestamp,
        path,
      );
    } else if (status === HttpStatus.FORBIDDEN) {
      errorResponse = this.handleForbiddenError(
        exception,
        errorId,
        timestamp,
        path,
      );
    } else if (status === HttpStatus.NOT_FOUND) {
      errorResponse = this.handleNotFoundError(
        exception,
        errorId,
        timestamp,
        path,
      );
    } else if (status === HttpStatus.BAD_REQUEST) {
      errorResponse = this.handleBadRequestError(
        exception,
        errorId,
        timestamp,
        path,
      );
    } else {
      errorResponse = this.handleGenericHttpError(
        exception,
        errorId,
        timestamp,
        path,
      );
    }

    // Log según la severidad del error
    if (status >= 500) {
      this.logger.error(exception.message, exception.stack, logContext);
    } else if (status >= 400) {
      this.logger.warn(`HTTP ${status}: ${exception.message}`, logContext);
    }

    response.status(status).json(errorResponse);
  }

  private handleUnauthorizedError(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      code: ErrorCodes.UNAUTHORIZED,
      timestamp,
      path,
      errorId,
    };
  }

  private handleForbiddenError(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Insufficient permissions',
      code: ErrorCodes.FORBIDDEN,
      timestamp,
      path,
      errorId,
    };
  }

  private handleNotFoundError(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Resource not found',
      code: ErrorCodes.RESOURCE_NOT_FOUND,
      timestamp,
      path,
      errorId,
    };
  }

  private handleBadRequestError(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;

      // Manejar errores de validación
      if (Array.isArray(responseObj.message)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          code: ErrorCodes.VALIDATION_ERROR,
          details: responseObj.message,
          timestamp,
          path,
          errorId,
        };
      }
    }

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      code: ErrorCodes.INVALID_INPUT,
      timestamp,
      path,
      errorId,
    };
  }

  private handleGenericHttpError(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ): ErrorResponseDto {
    const status = exception.getStatus();

    return {
      statusCode: status,
      message: exception.message,
      code: this.getErrorCodeFromStatus(status),
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

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
