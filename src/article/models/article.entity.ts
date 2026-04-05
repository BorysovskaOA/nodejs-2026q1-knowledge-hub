import { ApiSchema } from '@nestjs/swagger';
import { BaseEntity } from 'src/core/base.entity';
import { ArticleStatus } from './article.constants';

@ApiSchema({ name: 'Article' })
export class ArticleEntity extends BaseEntity<ArticleEntity> {
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;

  constructor(
    articleData: Omit<ArticleEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    const createdAt = Date.now();

    super({
      ...articleData,
      createdAt,
      updatedAt: createdAt,
    });
  }

  update(articleData: Partial<ArticleEntity>): ArticleEntity {
    return super.update({
      ...articleData,
      updatedAt: Date.now(),
    });
  }
}
