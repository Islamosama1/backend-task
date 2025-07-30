import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { seedUnits } from '../seed/units';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from './database/schemas/property.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Property Viewing Scheduler API')
    .setDescription('API for scheduling property viewings')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const appPort =
    process.env.PORT || configService.get<number>('app.port') || 8080;

  app.use((req, res, next) => {
    logger.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  await app.listen(appPort);
  logger.log(`Application is running on: http://localhost:${appPort}`);

  const propertyModel = app.get<Model<Property>>(getModelToken(Property.name));
  await seedUnits(propertyModel);
  logger.log('Database seeded successfully');
}

bootstrap();
