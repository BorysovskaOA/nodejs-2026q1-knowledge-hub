import { Injectable } from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { UserListFiltersPaginatedDto } from './models/user-list-filter.dto';
import { CreateUserDto } from './models/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private db(tx?: Prisma.TransactionClient) {
    return tx ? tx.user : this.prisma.user;
  }

  private map(data: User): UserEntity {
    return new UserEntity(data);
  }

  async findAll(): Promise<UserEntity[]> {
    const items = await this.db().findMany();

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
      this.db().findMany({
        take: limit,
        skip: skip,
        orderBy: sortKey ? { [sortKey]: sortOrder.toLowerCase() } : undefined,
      }),
      this.db().count(),
    ]);

    return new PaginatedResponseDto(items.map(this.map), total, page, limit);
  }

  async findById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<UserEntity | null> {
    const item = await this.db(tx).findUnique({ where: { id } });

    return item ? this.map(item) : null;
  }

  async findUnique(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<UserEntity | null> {
    const item = await this.db().findUnique({ where });

    return item ? this.map(item) : null;
  }

  async create(
    data: Omit<CreateUserDto, 'password'> & { passwordHash: string },
    tx?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const item = await this.db(tx).create({ data });

    return this.map(item);
  }

  async update(
    id: string,
    data: Partial<UserEntity>,
    tx?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const item = await this.db(tx).update({
      where: { id },
      data,
    });

    return this.map(item);
  }

  async delete(id: string): Promise<UserEntity> {
    const item = await this.db().delete({
      where: { id },
    });

    return this.map(item);
  }
}
