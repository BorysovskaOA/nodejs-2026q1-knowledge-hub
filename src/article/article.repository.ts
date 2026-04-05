import { Injectable } from '@nestjs/common';
import { ArticleListFiltersDto } from './models/article-list-filter.dto';
import { BaseRepository } from 'src/core/base.repository';
import { ArticleEntity } from './models/article.entity';

@Injectable()
export class ArticleRepository extends BaseRepository<ArticleEntity> {
  constructor() {
    super(ArticleEntity);
  }

  findAll({ status, categoryId, tag }: ArticleListFiltersDto): ArticleEntity[] {
    return this.items.filter((a) => {
      if (status && a.status !== status) return false;
      if (categoryId !== undefined && a.categoryId !== categoryId) return false;
      if (tag && !a.tags.includes(tag)) return false;

      return true;
    });
  }
}
