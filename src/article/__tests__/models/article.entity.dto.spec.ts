import { instanceToPlain } from 'class-transformer';
import { ArticleEntity } from 'src/article/models/article.entity';
import { describe, it, expect } from 'vitest';

const rawData = {
  id: 'id',
  title: 'Article title',
  content: 'Article content',
  status: 'draft',
  authorId: 'authorId',
  categoryId: 'categoryId',
  tags: ['tag'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Article Entity', () => {
  it('return data', () => {
    const entity = new ArticleEntity(rawData as any);

    expect(entity).toMatchObject(rawData);
  });

  it('should transform dates', () => {
    const entity = new ArticleEntity(rawData as any);

    const plainEntity = instanceToPlain(entity);

    expect(typeof plainEntity.createdAt).toBe('number');
    expect(typeof plainEntity.updatedAt).toBe('number');
  });
});
