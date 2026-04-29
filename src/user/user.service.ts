import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './models/create-user.dto';
import { hash, hashCompare } from '../core/utils/hashing.util';
import { UpdatePasswordDto } from './models/update-password.dto';
import { UserListFiltersPaginatedDto } from './models/user-list-filter.dto';
import { UserEntity } from './models/user.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(data: CreateUserDto, tx?: Prisma.TransactionClient) {
    const { password, ...restData } = data;
    const hashedPassword = await hash(password);
    const userData = {
      ...restData,
      passwordHash: hashedPassword,
    };
    return this.userRepository.create(userData, tx);
  }

  async getAll() {
    return this.userRepository.findAll();
  }

  async getAllPaginated(filter: UserListFiltersPaginatedDto) {
    return this.userRepository.findAllPaginated(filter);
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException();

    return user;
  }

  async getOne(where: Prisma.UserWhereUniqueInput) {
    return await this.userRepository.findUnique(where);
  }

  async updatePassword(id: string, data: UpdatePasswordDto) {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException();

    const oldPasswordValid = await hashCompare(
      data.oldPassword,
      user.passwordHash,
    );

    if (!oldPasswordValid) {
      throw new ForbiddenException();
    }

    const newHashedPassword = await hash(data.newPassword);

    return this.userRepository.update(id, {
      passwordHash: newHashedPassword,
    });
  }

  async update(
    id: string,
    data: Partial<UserEntity>,
    tx?: Prisma.TransactionClient,
  ) {
    const user = await this.userRepository.findById(id, tx);

    if (!user) throw new NotFoundException();

    return this.userRepository.update(id, data, tx);
  }

  async delete(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException();

    return this.userRepository.delete(id);
  }

  async validateUserExist(id: string) {
    const user = await this.userRepository.findById(id);

    return !!user;
  }

  async validateUserExistWithException(id: string) {
    const exist = await this.validateUserExist(id);

    if (!exist) {
      throw new BadRequestException();
    }
  }
}
