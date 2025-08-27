import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCodes } from '../enums/error-codes.enum';

export class ErrorUtil {
  static throwBusinessError(
    message: string,
    code: ErrorCodes,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: string[],
  ): never {
    throw new BusinessException(message, code, statusCode, details);
  }

  static throwNotFound(resource: string, identifier?: string): never {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    throw new BusinessException(
      message,
      ErrorCodes.RESOURCE_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }

  static throwAlreadyExists(resource: string, field?: string): never {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;

    throw new BusinessException(
      message,
      ErrorCodes.RESOURCE_ALREADY_EXISTS,
      HttpStatus.CONFLICT,
    );
  }

  static throwInsufficientPermissions(action?: string): never {
    const message = action
      ? `Insufficient permissions to ${action}`
      : 'Insufficient permissions';

    throw new BusinessException(
      message,
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      HttpStatus.FORBIDDEN,
    );
  }

  static throwValidationError(message: string, details?: string[]): never {
    throw new BusinessException(
      message,
      ErrorCodes.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      details,
    );
  }
}
