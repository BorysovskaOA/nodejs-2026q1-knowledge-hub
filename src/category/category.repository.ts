import { Injectable } from '@nestjs/common';
import { CategoryEntity } from './models/category.entity';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { CreateCategoryDto } from './models/create-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private db(tx?: Prisma.TransactionClient) {
    return (tx || this.prisma).category;
  }

  private map(data: Category): CategoryEntity {
    return new CategoryEntity(data);
  }

  async findAll(tx?: Prisma.TransactionClient): Promise<CategoryEntity[]> {
    const items = await this.db(tx).findMany({
      orderBy: { name: SortOrder.ASC },
    });

    return items.map(this.map);
  }

  async findById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CategoryEntity | null> {
    const item = await this.db(tx).findUnique({ where: { id } });

    return item ? this.map(item) : null;
  }

  async findOne(
    where: Prisma.CategoryWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<CategoryEntity | null> {
    const item = await this.db(tx).findFirst({ where });

    return item ? this.map(item) : null;
  }

  async create(
    data: CreateCategoryDto,
    tx?: Prisma.TransactionClient,
  ): Promise<CategoryEntity> {
    const item = await this.db(tx).create({ data });

    return this.map(item);
  }

  async update(
    id: string,
    data: Partial<CategoryEntity>,
    tx?: Prisma.TransactionClient,
  ): Promise<CategoryEntity> {
    const item = await this.db(tx).update({
      where: { id },
      data,
    });

    return this.map(item);
  }

  async delete(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CategoryEntity> {
    const item = await this.db(tx).delete({
      where: { id },
    });

    return this.map(item);
  }
}
