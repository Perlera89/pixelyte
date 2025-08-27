import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerService = new LoggerService();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('should log info message with context', () => {
      const message = 'Test message';
      const context = { userId: '123', action: 'test' };

      loggerService.log(message, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"INFO"'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Test message"'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"123"'),
      );
    });

    it('should log message without context', () => {
      const message = 'Simple message';

      loggerService.log(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Simple message"'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"context":{}'),
      );
    });
  });

  describe('error', () => {
    it('should log error with trace and context', () => {
      const errorSpy = jest.spyOn(console, 'error');
      const message = 'Error message';
      const trace = 'Error stack trace';
      const context = { userId: '123' };

      loggerService.error(message, trace, context);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"ERROR"'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Error message"'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"trace":"Error stack trace"'),
      );
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      const warnSpy = jest.spyOn(console, 'warn');
      const message = 'Warning message';

      loggerService.warn(message);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"WARN"'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Warning message"'),
      );
    });
  });

  describe('debug', () => {
    it('should log debug message in development', () => {
      const debugSpy = jest.spyOn(console, 'debug');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      loggerService.debug('Debug message');

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"DEBUG"'),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug message in production', () => {
      const debugSpy = jest.spyOn(console, 'debug');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      loggerService.debug('Debug message');

      expect(debugSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('specialized logging methods', () => {
    it('should log request with proper context', () => {
      loggerService.logRequest('GET', '/api/users', 200, 150, {
        userId: '123',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"type":"request"'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"method":"GET"'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"statusCode":200'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"responseTime":150'),
      );
    });

    it('should log error with proper context', () => {
      const errorSpy = jest.spyOn(console, 'error');
      const error = new Error('Test error');

      loggerService.logError(error, { userId: '123' });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"errorName":"Error"'),
      );
    });

    it('should log business event', () => {
      const eventData = { productId: '123', quantity: 2 };

      loggerService.logBusinessEvent('product_added_to_cart', eventData, {
        userId: '123',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"type":"business_event"'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"event":"product_added_to_cart"'),
      );
    });

    it('should log security event', () => {
      const warnSpy = jest.spyOn(console, 'warn');

      loggerService.logSecurityEvent('failed_login_attempt', {
        ip: '192.168.1.1',
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"type":"security_event"'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"event":"failed_login_attempt"'),
      );
    });
  });

  describe('message formatting', () => {
    it('should format message as JSON with timestamp', () => {
      loggerService.log('Test message');

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData).toHaveProperty('timestamp');
      expect(logData).toHaveProperty('level', 'INFO');
      expect(logData).toHaveProperty('message', 'Test message');
      expect(logData).toHaveProperty('context');
      expect(new Date(logData.timestamp)).toBeInstanceOf(Date);
    });
  });
});
