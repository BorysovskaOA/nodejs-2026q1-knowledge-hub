import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './models/create-user.dto';
import { hash, hashCompare } from 'src/core/utils/hashing.util';
import { UpdatePasswordDto } from './models/update-password.dto';
import { UserListFiltersPaginatedDto } from './models/user-list-filter.dto';
import { UserEntity } from './models/user.entity';
import { Prisma } from '@prisma/client';
import { formatUniqueConstraintError } from 'src/core/utils/format-prisma-errors.util';
import { isUniqueConstraint } from 'src/core/utils/is-prisma-error.util';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/core/exceptions/app-errors';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/core/configs/env.config';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository,
    private configService: ConfigService<EnvironmentVariables, true>,
  ) { }

  async create(
    data: CreateUserDto,
    tx?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const { password, ...restData } = data;
    const hashedPassword = await hash(password, this.configService.get('SALT_ROUNDS'));
    const userData = {
      ...restData,
      passwordHash: hashedPassword,
    };

    try {
      return await this.userRepository.create(userData, tx);
    } catch (err) {
      if (isUniqueConstraint(err))
        throw new ConflictError(
          formatUniqueConstraintError(err),
          UserService.name,
        );

      throw err;
    }
  }

  async getAll(tx?: Prisma.TransactionClient) {
    return this.userRepository.findAll(tx);
  }

  async getAllPaginated(
    filter: UserListFiltersPaginatedDto,
    tx?: Prisma.TransactionClient,
  ) {
    return this.userRepository.findAllPaginated(filter, tx);
  }

  async getById(id: string, tx?: Prisma.TransactionClient) {
    const user = await this.userRepository.findById(id, tx);

    if (!user)
      throw new NotFoundError(`User ${id} is not found`, UserService.name);

    return user;
  }

  async getOne(where: Prisma.UserWhereInput, tx?: Prisma.TransactionClient) {
    return await this.userRepository.findOne(where, tx);
  }

  async updatePassword(
    id: string,
    data: UpdatePasswordDto,
    tx?: Prisma.TransactionClient,
  ) {
    const user = await this.getById(id, tx);

    const oldPasswordValid = await hashCompare(
      data.oldPassword,
      user.passwordHash,
    );

    if (!oldPasswordValid)
      throw new ForbiddenError('Credentials are not valid', UserService.name);

    const newHashedPassword = await hash(data.newPassword, this.configService.get('SALT_ROUNDS'));

    return this.userRepository.update(
      id,
      { passwordHash: newHashedPassword },
      tx,
    );
  }

  async update(
    id: string,
    data: Partial<UserEntity>,
    tx?: Prisma.TransactionClient,
  ) {
    const user = await this.getById(id, tx);

    return this.userRepository.update(user.id, data, tx);
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    const user = await this.getById(id, tx);

    return this.userRepository.delete(user.id, tx);
  }

  async validateUserExist(id: string, tx?: Prisma.TransactionClient) {
    const user = await this.userRepository.findById(id, tx);

    return !!user;
  }

  async validateUserExistWithBadRequestError(
    id: string,
    fieldName: string = 'login',
    tx?: Prisma.TransactionClient,
  ) {
    const exist = await this.validateUserExist(id, tx);

    if (!exist) {
      throw new BadRequestError(
        { [fieldName]: [`${fieldName} is already taken`] },
        UserService.name,
      );
    }
  }
}
