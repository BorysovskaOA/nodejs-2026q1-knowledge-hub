import { ApiSchema } from '@nestjs/swagger';
import { Category as PrismaCategory } from '@prisma/client';

@ApiSchema({ name: 'Category' })
export class CategoryEntity implements PrismaCategory {
  id: string;
  name: string;
  description: string;

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}
