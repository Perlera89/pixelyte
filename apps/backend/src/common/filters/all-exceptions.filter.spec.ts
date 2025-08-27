import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { LoggerService } from '../services/logger.service';
import { ErrorCodes } from '../enums/error-codes.enum';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let loggerService: LoggerService;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
      body: {},
      user: { id: 'user-123' },
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: LoggerService,
          useValue: {
            logError: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  describe('HttpException handling', () => {
    it('should handle basic HttpException', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          code: ErrorCodes.INVALID_INPUT,
          timestamp: expect.any(String),
          path: '/api/test',
          errorId: expect.any(String),
        }),
      );
    });

    it('should handle validation errors', () => {
      const exception = new HttpException(
        {
          message: ['email must be valid', 'password is too short'],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          code: ErrorCodes.VALIDATION_ERROR,
          details: ['email must be valid', 'password is too short'],
        }),
      );
    });

    it('should handle business exceptions with custom codes', () => {
      const exception = new HttpException(
        {
          message: 'Insufficient stock',
          code: ErrorCodes.INSUFFICIENT_STOCK,
          details: ['Only 5 items available'],
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient stock',
          code: ErrorCodes.INSUFFICIENT_STOCK,
          details: ['Only 5 items available'],
        }),
      );
    });
  });

  describe('Prisma error handling', () => {
    it('should handle unique constraint violation (P2002)', () => {
      const exception = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: ['email'] },
        },
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          message: 'Resource already exists',
          code: ErrorCodes.UNIQUE_CONSTRAINT_VIOLATION,
          prismaCode: 'P2002',
          field: 'email',
        }),
      );
    });

    it('should handle record not found (P2025)', () => {
      const exception = new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '4.0.0',
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          code: ErrorCodes.RECORD_NOT_FOUND,
          prismaCode: 'P2025',
        }),
      );
    });
  });

  describe('Unknown error handling', () => {
    it('should handle unknown errors', () => {
      const exception = new Error('Unknown error');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
        }),
      );
    });
  });

  describe('Logging', () => {
    it('should log errors with context', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(loggerService.logError).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          userId: 'user-123',
          method: 'GET',
          url: '/api/test',
          errorResponse: expect.any(Object),
        }),
      );
    });

    it('should sanitize sensitive data in request body', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'secret123',
        token: 'jwt-token',
      };

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(loggerService.logError).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          body: {
            email: 'test@example.com',
            password: '[REDACTED]',
            token: '[REDACTED]',
          },
        }),
      );
    });
  });
});
