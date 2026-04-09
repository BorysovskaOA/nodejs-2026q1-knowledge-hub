import { Injectable } from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { UserListFiltersPaginatedDto } from './models/user-list-filter.dto';
import { CreateUserDto } from './models/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma.user;
  }

  private map(data: User): UserEntity {
    return new UserEntity(data);
  }

  async findAll(): Promise<UserEntity[]> {
    const items = await this.db.findMany();

    return items.map(this.map);
  }

  async findAllPaginated({
    page,
    limit,
    sortKey,
    sortOrder,
  }: UserListFiltersPaginatedDto): Promise<PaginatedResponseDto<UserEntity>> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.db.findMany({
        take: limit,
        skip: skip,
        orderBy: sortKey ? { [sortKey]: sortOrder.toLowerCase() } : undefined,
      }),
      this.db.count(),
    ]);

    return new PaginatedResponseDto(items.map(this.map), total, page, limit);
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const item = await this.db.findUnique({ where: { id } });

    return item ? this.map(item) : null;
  }

  async create(
    data: Omit<CreateUserDto, 'password'> & { passwordHash: string },
  ): Promise<UserEntity> {
    const item = await this.db.create({ data });

    return this.map(item);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const item = await this.db.update({
      where: { id },
      data,
    });

    return this.map(item);
  }

  async delete(id: string): Promise<UserEntity> {
    const item = await this.db.delete({
      where: { id },
    });

    return this.map(item);
  }
}
