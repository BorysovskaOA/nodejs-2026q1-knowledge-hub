import { instanceToPlain } from 'class-transformer';
import { CommentEntity } from 'src/comment/models/comment.entity';
import { describe, it, expect } from 'vitest';

const rawData = {
  id: 'id',
  content: 'Comment title',
  authorId: 'authorId',
  articleId: 'articleId',
  createdAt: new Date(),
};

describe('Comment Entity', () => {
  it('return data', () => {
    const entity = new CommentEntity(rawData as any);

    expect(entity).toMatchObject(rawData);
  });

  it('should transform dates', () => {
    const entity = new CommentEntity(rawData as any);

    const plainEntity = instanceToPlain(entity);

    expect(typeof plainEntity.createdAt).toBe('number');
  });
});
