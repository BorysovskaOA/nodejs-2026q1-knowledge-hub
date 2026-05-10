import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import 'dotenv/config';
import { generateSwaggerDocumentConfig } from './core/utils/generate-swagger-document-config.util';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { setupProcessErrorHandler } from './core/exceptions/process-error-handler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.useLogger(app.get(Logger));

  setupProcessErrorHandler(app);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = generateSwaggerDocumentConfig();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();
