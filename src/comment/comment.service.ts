import { Injectable } from '@nestjs/common';
import { Comment } from './interfaces/comment.interface';

@Injectable()
export class CommentService {
  private comments: Comment[] = [];

  create(article: Comment) {
    this.comments.push(article);
  }

  getAll({ articleId }: { articleId: string }) {
    return this.comments.filter((a) => {
      if (articleId && a.articleId !== articleId) return false;

      return true;
    });
  }

  getById(id: string) {
    return this.comments.find((c) => c.id === id);
  }

  update(id: string, article: Comment) {
    this.comments = this.comments.map((c) => (c.id === id ? article : c));
  }

  delete(id: string) {
    this.comments = this.comments.filter((c) => c.id !== id);
  }
}
