import { ApiSchema } from '@nestjs/swagger';
import { BaseEntity } from 'src/core/base.entity';

@ApiSchema({ name: 'Category' })
export class CategoryEntity extends BaseEntity<CategoryEntity> {
  id: string;
  name: string;
  description: string;

  constructor(categoryData: Omit<CategoryEntity, 'id'>) {
    super(categoryData);
  }
}
