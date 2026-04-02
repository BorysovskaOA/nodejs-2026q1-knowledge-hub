import { Injectable } from '@nestjs/common';
import { Article, ArticleStatus } from './interfaces/article.interface';

@Injectable()
export class ArticleService {
  private articles: Article[] = [];

  create(article: Article) {
    this.articles.push(article);
  }

  getAll({
    status,
    categoryId,
    tag,
  }: {
    status: ArticleStatus;
    categoryId: string;
    tag: string;
  }) {
    return this.articles.filter((a) => {
      if (status && a.status !== status) return false;
      if (categoryId && a.categoryId !== categoryId) return false;
      if (tag && !a.tags.includes(tag)) return false;

      return true;
    });
  }

  getById(id: string) {
    return this.articles.find((a) => a.id === id);
  }

  update(id: string, article: Article) {
    this.articles = this.articles.map((a) => (a.id === id ? article : a));
  }

  delete(id: string) {
    this.articles = this.articles.filter((a) => a.id !== id);
  }
}
