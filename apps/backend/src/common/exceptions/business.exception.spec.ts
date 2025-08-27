import { HttpStatus } from '@nestjs/common';
import {
  BusinessException,
  InsufficientStockException,
  EmptyCartException,
  OrderAlreadyProcessedException,
  InvalidOrderStatusException,
} from './business.exception';
import { ErrorCodes } from '../enums/error-codes.enum';

describe('BusinessException', () => {
  describe('BusinessException', () => {
    it('should create a business exception with default status', () => {
      const exception = new BusinessException(
        'Test error',
        ErrorCodes.VALIDATION_ERROR,
      );

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getResponse()).toEqual({
        message: 'Test error',
        code: ErrorCodes.VALIDATION_ERROR,
        details: undefined,
      });
    });

    it('should create a business exception with custom status and details', () => {
      const details = ['Detail 1', 'Detail 2'];
      const exception = new BusinessException(
        'Custom error',
        ErrorCodes.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        details,
      );

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.getResponse()).toEqual({
        message: 'Custom error',
        code: ErrorCodes.RESOURCE_NOT_FOUND,
        details,
      });
    });
  });

  describe('InsufficientStockException', () => {
    it('should create an insufficient stock exception', () => {
      const exception = new InsufficientStockException('iPhone 14', 5);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getResponse()).toEqual({
        message: 'Insufficient stock for product: iPhone 14',
        code: ErrorCodes.INSUFFICIENT_STOCK,
        details: ['Available stock: 5'],
      });
    });
  });

  describe('EmptyCartException', () => {
    it('should create an empty cart exception', () => {
      const exception = new EmptyCartException();

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getResponse()).toEqual({
        message: 'Cannot proceed with empty cart',
        code: ErrorCodes.CART_EMPTY,
        details: undefined,
      });
    });
  });

  describe('OrderAlreadyProcessedException', () => {
    it('should create an order already processed exception', () => {
      const orderId = 'order-123';
      const exception = new OrderAlreadyProcessedException(orderId);

      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.getResponse()).toEqual({
        message: `Order ${orderId} has already been processed`,
        code: ErrorCodes.ORDER_ALREADY_PROCESSED,
        details: undefined,
      });
    });
  });

  describe('InvalidOrderStatusException', () => {
    it('should create an invalid order status exception', () => {
      const exception = new InvalidOrderStatusException('DELIVERED', 'PENDING');

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getResponse()).toEqual({
        message: 'Cannot change order status from DELIVERED to PENDING',
        code: ErrorCodes.INVALID_ORDER_STATUS,
        details: undefined,
      });
    });
  });
});
