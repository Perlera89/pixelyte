import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '../enums/error-codes.enum';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: ErrorCodes,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: string[],
  ) {
    super(
      {
        message,
        code,
        details,
      },
      statusCode,
    );
  }
}

export class InsufficientStockException extends BusinessException {
  constructor(productName: string, availableStock: number) {
    super(
      `Insufficient stock for product: ${productName}`,
      ErrorCodes.INSUFFICIENT_STOCK,
      HttpStatus.BAD_REQUEST,
      [`Available stock: ${availableStock}`],
    );
  }
}

export class EmptyCartException extends BusinessException {
  constructor() {
    super(
      'Cannot proceed with empty cart',
      ErrorCodes.CART_EMPTY,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OrderAlreadyProcessedException extends BusinessException {
  constructor(orderId: string) {
    super(
      `Order ${orderId} has already been processed`,
      ErrorCodes.ORDER_ALREADY_PROCESSED,
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidOrderStatusException extends BusinessException {
  constructor(currentStatus: string, attemptedStatus: string) {
    super(
      `Cannot change order status from ${currentStatus} to ${attemptedStatus}`,
      ErrorCodes.INVALID_ORDER_STATUS,
      HttpStatus.BAD_REQUEST,
    );
  }
}
