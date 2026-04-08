import { Injectable } from '@nestjs/common';
import { CategoryEntity } from './models/category.entity';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { SortOrder } from 'src/core/dtos/sorting.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma.category;
  }

  private map(data: Category): CategoryEntity {
    return new CategoryEntity(data);
  }

  async findAll(): Promise<CategoryEntity[]> {
    const items = await this.db.findMany({
      orderBy: { name: SortOrder.ASC },
    });

    return items.map(this.map);
  }

  async findOne(id: string): Promise<CategoryEntity | null> {
    const item = await this.db.findUnique({ where: { id } });

    return item ? this.map(item) : null;
  }

  async create(
    data: Prisma.CategoryUncheckedCreateInput,
  ): Promise<CategoryEntity> {
    const item = await this.db.create({ data });

    return this.map(item);
  }

  async update(
    id: string,
    data: Partial<CategoryEntity>,
  ): Promise<CategoryEntity> {
    const item = await this.db.update({
      where: { id },
      data,
    });

    return this.map(item);
  }

  async delete(id: string): Promise<CategoryEntity> {
    const item = await this.db.delete({
      where: { id },
    });

    return this.map(item);
  }
}
