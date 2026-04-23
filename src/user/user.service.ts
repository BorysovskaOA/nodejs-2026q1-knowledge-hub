import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './models/create-user.dto';
import { hash, hashCompare } from 'src/core/utils/hashing.util';
import { UpdatePasswordDto } from './models/update-password.dto';
import { UserListFiltersPaginatedDto } from './models/user-list-filter.dto';
import { UserEntity } from './models/user.entity';
import { Prisma } from '@prisma/client';
import { formatUniqueConstraintError } from 'src/core/utils/format-prisma-errors.util';
import { isUniqueConstraint } from 'src/core/utils/is-prisma-error.util';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(
    data: CreateUserDto,
    tx?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const { password, ...restData } = data;
    const hashedPassword = await hash(password);
    const userData = {
      ...restData,
      passwordHash: hashedPassword,
    };

    try {
      return await this.userRepository.create(userData, tx);
    } catch (err) {
      if (isUniqueConstraint(err))
        throw new ConflictException(
          formatUniqueConstraintError(err, StatusCodes.CONFLICT),
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

    if (!user) throw new NotFoundException();

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

    if (!oldPasswordValid) {
      throw new ForbiddenException();
    }

    const newHashedPassword = await hash(data.newPassword);

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

  async validateUserExistWithException(
    id: string,
    fieldName: string = 'login',
    tx?: Prisma.TransactionClient,
  ) {
    const exist = await this.validateUserExist(id, tx);

    if (!exist) {
      throw new BadRequestException({
        statusCode: StatusCodes.BAD_REQUEST,
        error: getReasonPhrase(StatusCodes.BAD_REQUEST),
        message: [
          { field: fieldName, errors: [`${fieldName} is already taken`] },
        ],
      });
    }
  }
}
