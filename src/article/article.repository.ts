import { PaginatedResponseDto } from './../core/dtos/paginated-response.dto';
import { Injectable } from '@nestjs/common';
import {
  ArticleListFiltersDto,
  ArticleListFiltersPaginatdDto,
} from './models/article-list-filter.dto';
import { ArticleEntity } from './models/article.entity';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateArticleDto } from './models/create-article.dto';

type ArticleWithTags = Prisma.ArticleGetPayload<{
  include: { tags: true };
}>;

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma.article;
  }

  private map(data: ArticleWithTags): ArticleEntity {
    return new ArticleEntity({
      ...data,
      tags: data.tags.map((t: any) => t.name) || [],
    });
  }

  private formatFindAllWhereFilter({
    status,
    categoryId,
    tag,
  }: ArticleListFiltersDto) {
    return {
      status: status,
      categoryId: categoryId,
      tags: tag ? { some: { name: tag } } : undefined,
    };
  }

  async findAll(filter: ArticleListFiltersDto): Promise<ArticleEntity[]> {
    const items = await this.db.findMany({
      where: this.formatFindAllWhereFilter(filter),
      include: { tags: true },
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
        include: { tags: true },
        take: limit,
        skip: skip,
        orderBy: sortKey ? { [sortKey]: sortOrder.toLowerCase() } : undefined,
      }),
      this.db.count({ where: whereFilter }),
    ]);

    return new PaginatedResponseDto(items.map(this.map), total, page, limit);
  }

  async findOne(id: string): Promise<ArticleEntity | null> {
    const item = await this.db.findUnique({
      where: { id },
      include: { tags: true },
    });

    return item ? this.map(item) : null;
  }

  async create(data: CreateArticleDto): Promise<ArticleEntity> {
    const item = await this.db.create({
      data: {
        ...data,
        tags: {
          connectOrCreate: data.tags?.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    return this.map(item);
  }

  async update(
    id: string,
    data: Partial<ArticleEntity>,
  ): Promise<ArticleEntity> {
    const item = await this.db.update({
      where: { id },
      data: {
        ...data,
        tags: {
          set: [],
          connectOrCreate: data.tags?.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    });

    return this.map(item);
  }

  async delete(id: string): Promise<ArticleEntity> {
    const item = await this.db.delete({
      where: { id },
      include: { tags: true },
    });

    return this.map(item);
  }
}
