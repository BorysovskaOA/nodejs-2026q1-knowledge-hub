import { Injectable } from '@nestjs/common';
import {
  CommentListFiltersDto,
  CommentListFiltersPaginatedDto,
} from './models/comment-list-filter.dto';
import { CommentEntity } from './models/comment.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Comment, Prisma } from '@prisma/client';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { CreateCommentDto } from './models/create-comment.dto';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private db(tx?: Prisma.TransactionClient) {
    return (tx || this.prisma).comment;
  }

  private map(data: Comment): CommentEntity {
    return new CommentEntity(data);
  }

  private formatFindAllWhereFilter({ articleId }: CommentListFiltersDto) {
    return {
      articleId,
    };
  }

  async findAll(
    filter: CommentListFiltersDto,
    tx?: Prisma.TransactionClient,
  ): Promise<CommentEntity[]> {
    const items = await this.db(tx).findMany({
      where: this.formatFindAllWhereFilter(filter),
    });

    return items.map(this.map);
  }

  async findAllPaginated(
    {
      page,
      limit,
      sortKey,
      sortOrder,
      ...restFilter
    }: CommentListFiltersPaginatedDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponseDto<CommentEntity>> {
    const whereFilter = this.formatFindAllWhereFilter(restFilter);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.db(tx).findMany({
        where: whereFilter,
        take: limit,
        skip: skip,
        orderBy: sortKey ? { [sortKey]: sortOrder.toLowerCase() } : undefined,
      }),
      this.db(tx).count({ where: whereFilter }),
    ]);

    return new PaginatedResponseDto(items.map(this.map), total, page, limit);
  }

  async findById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CommentEntity | null> {
    const item = await this.db(tx).findUnique({ where: { id } });

    return item ? this.map(item) : null;
  }

  async findOne(
    where: Prisma.CommentWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<CommentEntity | null> {
    const item = await this.db(tx).findFirst({ where });

    return item ? this.map(item) : null;
  }

  async create(
    data: CreateCommentDto,
    tx?: Prisma.TransactionClient,
  ): Promise<CommentEntity> {
    const item = await this.db(tx).create({ data });

    return this.map(item);
  }

  async update(
    id: string,
    data: Partial<CommentEntity>,
    tx?: Prisma.TransactionClient,
  ): Promise<CommentEntity> {
    const item = await this.db(tx).update({
      where: { id },
      data,
    });

    return this.map(item);
  }

  async delete(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CommentEntity> {
    const item = await this.db(tx).delete({
      where: { id },
    });

    return this.map(item);
  }
}
