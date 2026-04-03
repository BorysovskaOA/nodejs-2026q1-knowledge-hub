import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { readFile } from 'node:fs/promises'; // Асинхронне читання
import { join } from 'node:path';
import * as yaml from 'js-yaml';

import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4000;

  try {
    const yamlPath = join(process.cwd(), '/doc/api.yaml');
    const fileContent = await readFile(yamlPath, 'utf8');
    const document = yaml.load(fileContent) as any;

    // Need to add this to have same server url to be available from tests and Swagger UI
    if (document.servers) {
      document.servers = document.servers.map(
        (server: Record<string, string>) => ({
          ...server,
          url: server.url.replace('/api', ''),
        }),
      );
    }

    SwaggerModule.setup('doc', app, document);
  } catch (error) {
    console.error(`Couldn't load swagger UI`);
  }

  await app.listen(port);
}
bootstrap();
