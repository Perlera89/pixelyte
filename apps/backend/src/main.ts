import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerService } from './common/services/logger.service';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
  PrismaErrorResponseDto,
} from './common/dto/error-response.dto';
import {
  ApiResponseDto,
  PaginatedResponseDto,
  ProductResponseDto,
  CartResponseDto,
  OrderResponseDto,
  WishlistResponseDto,
} from './common/dto/api-response.dto';
import {
  UserModelDto,
  ProductModelDto,
  CategoryModelDto,
  BrandModelDto,
  OrderModelDto,
  CartItemModelDto,
  UserAddressModelDto,
} from './common/dto/models.dto';
import {
  JwtTokenExampleDto,
  JwtPayloadExampleDto,
  AuthHeaderExampleDto,
  LoginExampleDto,
  RegisterExampleDto,
  AuthResponseExampleDto,
  RefreshTokenExampleDto,
  ValidateTokenResponseExampleDto,
  AuthErrorExamplesDto,
  JwtUsageGuideDto,
} from './common/dto/auth-examples.dto';
import { swaggerConfig, swaggerOptions } from './common/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener servicios del contenedor de dependencias
  const loggerService = app.get(LoggerService);

  // Configuración global de filtros de excepción
  app.useGlobalFilters(new AllExceptionsFilter(loggerService));

  // Configuración global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          return constraints
            ? Object.values(constraints).join(', ')
            : 'Validation error';
        });
        return new Error(messages.join('; '));
      },
    }),
  );

  // Configuración de CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // Configuración de Swagger
  const config = swaggerConfig;

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
    deepScanRoutes: true,
    extraModels: [
      // Error DTOs
      ErrorResponseDto,
      ValidationErrorResponseDto,
      PrismaErrorResponseDto,
      // Response DTOs
      ApiResponseDto,
      PaginatedResponseDto,
      ProductResponseDto,
      CartResponseDto,
      OrderResponseDto,
      WishlistResponseDto,
      // Model DTOs
      UserModelDto,
      ProductModelDto,
      CategoryModelDto,
      BrandModelDto,
      OrderModelDto,
      CartItemModelDto,
      UserAddressModelDto,
      // Auth Example DTOs
      JwtTokenExampleDto,
      JwtPayloadExampleDto,
      AuthHeaderExampleDto,
      LoginExampleDto,
      RegisterExampleDto,
      AuthResponseExampleDto,
      RefreshTokenExampleDto,
      ValidateTokenResponseExampleDto,
      AuthErrorExamplesDto,
      JwtUsageGuideDto,
    ],
  });

  SwaggerModule.setup('api/docs', app, document, swaggerOptions);

  await app.listen(process.env.PORT ?? 4000);
  console.log(
    `🚀 Aplicación ejecutándose en: http://localhost:${process.env.PORT ?? 4000}`,
  );
  console.log(
    `📚 Documentación Swagger en: http://localhost:${process.env.PORT ?? 4000}/api/docs`,
  );
}
bootstrap();
