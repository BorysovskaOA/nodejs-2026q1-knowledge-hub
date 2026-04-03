import { Injectable } from '@nestjs/common';
import { Comment } from './comment.interface';

@Injectable()
export class CommentRepository {
  private comments: Comment[] = [];

  findAll({
    articleId,
    authorId,
  }: { articleId?: string; authorId?: string } = {}): Comment[] {
    return this.comments.filter((a) => {
      if (articleId && a.articleId !== articleId) return false;
      if (authorId && a.authorId !== authorId) return false;

      return true;
    });
  }

  findOne(id: string): Comment | undefined {
    return this.comments.find((c) => c.id === id);
  }

  create(commentData: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const comment: Comment = {
      id: crypto.randomUUID(),
      ...commentData,
      createdAt: Date.now(),
    };

    this.comments.push(comment);

    return comment;
  }

  update(id: string, commentData: Partial<Comment>): Comment | undefined {
    const index = this.comments.findIndex((c) => c.id === id);
    if (index === -1) return;

    this.comments[index] = {
      ...this.comments[index],
      ...commentData,
    };

    return this.comments[index];
  }

  delete(id: string): boolean {
    const updatedComments = this.comments.filter((c) => c.id !== id);
    const updated = this.comments.length !== updatedComments.length;
    this.comments = updatedComments;
    return updated;
  }

  deleteBatch(ids: string[]) {
    const updatedComments = this.comments.filter((c) => !ids.includes(c.id));
    const updated = this.comments.length - updatedComments.length;
    this.comments = updatedComments;
    return updated;
  }
}
