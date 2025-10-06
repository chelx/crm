import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", 'data:', 'blob:'],
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      frameguard: { action: 'deny' },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }),
  );

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'v1');
  app.setGlobalPrefix(apiPrefix);

  // CORS configuration (tightened)
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  const corsMethods = configService.get<string>('CORS_METHODS', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  const corsHeaders = configService.get<string>('CORS_HEADERS', 'Content-Type,Authorization');
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: corsMethods,
    allowedHeaders: corsHeaders,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const swaggerTitle = configService.get<string>('SWAGGER_TITLE', 'CRM API');
  const swaggerDescription = configService.get<string>('SWAGGER_DESCRIPTION', 'Customer Relationship Management API');
  const swaggerVersion = configService.get<string>('SWAGGER_VERSION', '1.0');
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');

  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`);
}

bootstrap();
