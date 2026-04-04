import { Injectable } from '@nestjs/common';
import { Article } from './article.interface';
import { ArticleListFiltersDto } from './dtos/article-list-filter.dto';
import { BaseRepository } from 'src/core/base.repository';

@Injectable()
export class ArticleRepository extends BaseRepository<Article> {
  findAll({ status, categoryId, tag }: ArticleListFiltersDto): Article[] {
    return this.items.filter((a) => {
      if (status && a.status !== status) return false;
      if (categoryId !== undefined && a.categoryId !== categoryId) return false;
      if (tag && !a.tags.includes(tag)) return false;

      return true;
    });
  }

  create(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Article {
    const createdAt = Date.now();
    const articleData: Omit<Article, 'id'> = {
      ...data,
      createdAt,
      updatedAt: createdAt,
    };

    return super.create(articleData);
  }

  update(id: string, data: Partial<Article>): Article | undefined {
    const articleData: Omit<Partial<Article>, 'id'> = {
      ...data,
      updatedAt: Date.now(),
    };

    return super.update(id, articleData);
  }
}
