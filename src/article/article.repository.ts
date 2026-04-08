import { PaginatedResponseDto } from './../core/dtos/paginated-response.dto';
import { Injectable } from '@nestjs/common';
import {
  ArticleListFiltersDto,
  ArticleListFiltersPaginatdDto,
} from './models/article-list-filter.dto';
import { ArticleEntity } from './models/article.entity';
import { PrismaService } from 'prisma/prisma.service';
import { Article, Prisma } from '@prisma/client';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma.article;
  }

  private map(data: Article): ArticleEntity {
    return new ArticleEntity(data);
  }

  private formatFindAllWhereFilter({
    status,
    categoryId,
    tag,
  }: ArticleListFiltersDto) {
    return {
      status: status,
      categoryId: categoryId,
      tags: tag ? { has: tag } : undefined,
    };
  }

  async findAll(filter: ArticleListFiltersDto): Promise<ArticleEntity[]> {
    const items = await this.db.findMany({
      where: this.formatFindAllWhereFilter(filter),
    });

    return items.map(this.map);
  }

  async findAllPaginated({
    page,
    limit,
    sortKey,
    sortOrder,
    ...restFilter
  }: ArticleListFiltersPaginatdDto): Promise<
    PaginatedResponseDto<ArticleEntity>
  > {
    const whereFilter = this.formatFindAllWhereFilter(restFilter);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.db.findMany({
        where: whereFilter,
        take: limit,
        skip: skip,
        orderBy: sortKey ? { [sortKey]: sortOrder.toLowerCase() } : undefined,
      }),
      this.db.count({ where: whereFilter }),
    ]);

    return new PaginatedResponseDto(items.map(this.map), total, page, limit);
  }

  async findOne(id: string): Promise<ArticleEntity | null> {
    const item = await this.db.findUnique({ where: { id } });

    return item ? this.map(item) : null;
  }

  async create(
    data: Prisma.ArticleUncheckedCreateInput,
  ): Promise<ArticleEntity> {
    const item = await this.db.create({ data });

    return this.map(item);
  }

  async update(
    id: string,
    data: Partial<ArticleEntity>,
  ): Promise<ArticleEntity> {
    const item = await this.db.update({
      where: { id },
      data,
    });

    return this.map(item);
  }

  async delete(id: string): Promise<ArticleEntity> {
    const item = await this.db.delete({
      where: { id },
    });

    return this.map(item);
  }
}
