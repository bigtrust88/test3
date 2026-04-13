import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
// import { N8nAuthMiddleware } from './common/middleware'; // disabled

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api');

  // CORS Configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL || ''],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-N8N-Secret', '*'],
    optionsSuccessStatus: 200,
  });

  // n8n Internal API Authentication Middleware (disabled - modules not active)
  // Posts와 AI Logs의 internal 엔드포인트에 미들웨어 적용
  // app.use('/api/posts/internal', new N8nAuthMiddleware());
  // app.use('/api/ai-logs/internal', new N8nAuthMiddleware());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Stock Blog API')
    .setDescription('미국주식 블로그 자동화 API')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token',
      },
      'access-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-N8N-Secret',
        in: 'header',
        description: 'n8n Shared Secret',
      },
      'n8n-secret',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start Server
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`\n✅ Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs\n`);
}

bootstrap();
