import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'GenerateResponse' })
export class GenerateEntity {
  content: string;

  constructor(partial: Partial<GenerateEntity>) {
    Object.assign(this, partial);
  }
}
