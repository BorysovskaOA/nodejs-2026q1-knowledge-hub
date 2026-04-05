import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';

import 'dotenv/config';
import { generateSwaggerDocumentConfig } from './core/utils/generate-swagger-document-config.util';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4000;

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = generateSwaggerDocumentConfig();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  await app.listen(port);
}
bootstrap();
