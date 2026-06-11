import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { generateSwaggerDocumentConfig } from './core/utils/generate-swagger-document-config.util';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { setupProcessErrorHandler } from './core/exceptions/process-error-handler';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();
  setupProcessErrorHandler(app);

  app.use(helmet());
  app.enableCors();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('api', { exclude: ['/health'] });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const swaggerConfig = generateSwaggerDocumentConfig();
  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('doc', app, documentFactory);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', { infer: true });
  await app.listen(port);
}
bootstrap();
