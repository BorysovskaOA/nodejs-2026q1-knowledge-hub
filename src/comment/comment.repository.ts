import { Injectable } from '@nestjs/common';
import {
  CommentListFiltersDto,
  CommentListFiltersPaginatedDto,
} from './models/comment-list-filter.dto';
import { CommentEntity } from './models/comment.entity';
import { PrismaService } from 'prisma/prisma.service';
import { Comment, Prisma } from '@prisma/client';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma.comment;
  }

  private map(data: Comment): CommentEntity {
    return new CommentEntity(data);
  }

  private formatFindAllWhereFilter({ articleId }: CommentListFiltersDto) {
    return {
      articleId,
    };
  }

  async findAll(filter: CommentListFiltersDto): Promise<CommentEntity[]> {
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
  }: CommentListFiltersPaginatedDto): Promise<
    PaginatedResponseDto<CommentEntity>
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

  async findOne(id: string): Promise<CommentEntity | null> {
    const item = await this.db.findUnique({ where: { id } });

    return item ? this.map(item) : null;
  }

  async create(
    data: Prisma.CommentUncheckedCreateInput,
  ): Promise<CommentEntity> {
    const item = await this.db.create({ data });

    return this.map(item);
  }

  async update(
    id: string,
    data: Partial<CommentEntity>,
  ): Promise<CommentEntity> {
    const item = await this.db.update({
      where: { id },
      data,
    });

    return this.map(item);
  }

  async delete(id: string): Promise<CommentEntity> {
    const item = await this.db.delete({
      where: { id },
    });

    return this.map(item);
  }
}
