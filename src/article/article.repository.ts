import { Injectable } from '@nestjs/common';
import { Article, ArticleStatus } from './article.interface';

@Injectable()
export class ArticleRepository {
  private articles: Article[] = [];

  findAll({
    status,
    categoryId,
    authorId,
    tag,
  }: {
    status?: ArticleStatus;
    categoryId?: string | null;
    authorId?: string;
    tag?: string;
  } = {}) {
    return this.articles.filter((a) => {
      if (status && a.status !== status) return false;
      if (categoryId !== undefined && a.categoryId !== categoryId) return false;
      if (tag && !a.tags.includes(tag)) return false;
      if (authorId && a.authorId !== authorId) return false;

      return true;
    });
  }

  findOne(id: string) {
    return this.articles.find((a) => a.id === id);
  }

  create(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) {
    const createdAt = Date.now();
    const article: Article = {
      id: crypto.randomUUID(),
      ...articleData,
      createdAt,
      updatedAt: createdAt,
    };

    this.articles.push(article);

    return article;
  }

  update(id: string, articleData: Partial<Article>) {
    const index = this.articles.findIndex((c) => c.id === id);
    if (index === -1) return;

    this.articles[index] = {
      ...this.articles[index],
      ...articleData,
      updatedAt: Date.now(),
    };

    return this.articles[index];
  }

  updateBatch(articles: (Partial<Article> & Pick<Article, 'id'>)[]) {
    return articles.map((a) => {
      const updatedArticle = this.update(a.id, a);

      return updatedArticle?.id;
    });
  }

  delete(id: string) {
    const updatedArticles = this.articles.filter((a) => a.id !== id);
    const updated = this.articles.length !== updatedArticles.length;
    this.articles = updatedArticles;
    return updated;
  }
}
