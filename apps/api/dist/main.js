"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)({
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
    }));
    const apiPrefix = configService.get('API_PREFIX', 'v1');
    app.setGlobalPrefix(apiPrefix);
    const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
    const corsMethods = configService.get('CORS_METHODS', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    const corsHeaders = configService.get('CORS_HEADERS', 'Content-Type,Authorization');
    app.enableCors({
        origin: corsOrigin.split(',').map((o) => o.trim()),
        credentials: true,
        methods: corsMethods,
        allowedHeaders: corsHeaders,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const swaggerTitle = configService.get('SWAGGER_TITLE', 'CRM API');
    const swaggerDescription = configService.get('SWAGGER_DESCRIPTION', 'Customer Relationship Management API');
    const swaggerVersion = configService.get('SWAGGER_VERSION', '1.0');
    const swaggerPath = configService.get('SWAGGER_PATH', 'api/docs');
    const config = new swagger_1.DocumentBuilder()
        .setTitle(swaggerTitle)
        .setDescription(swaggerDescription)
        .setVersion(swaggerVersion)
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(swaggerPath, app, document);
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`);
}
bootstrap();
//# sourceMappingURL=main.js.map