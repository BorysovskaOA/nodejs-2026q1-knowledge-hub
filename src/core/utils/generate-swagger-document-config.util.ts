import { DocumentBuilder } from '@nestjs/swagger';

export const generateSwaggerDocumentConfig = () => {
  return new DocumentBuilder()
    .setTitle('Knowledge Hub')
    .setDescription(
      'Knowledge hub service for managing articles, categories, and comments',
    )
    .setVersion('1.0.0')
    .build();
};
