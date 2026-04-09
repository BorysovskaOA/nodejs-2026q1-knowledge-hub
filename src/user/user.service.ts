import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './models/create-user.dto';
import { hashPassword, verifyPassword } from './utils/password-hashing.util';
import { UpdatePasswordDto } from './models/update-password.dto';
import { UserListFiltersPaginatedDto } from './models/user-list-filter.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(data: CreateUserDto) {
    const { password, ...restData } = data;
    const hashedPassword = await hashPassword(password);
    const userData = {
      ...restData,
      passwordHash: hashedPassword,
    };
    return this.userRepository.create(userData);
  }

  async getAll() {
    return this.userRepository.findAll();
  }

  async getAllPaginated(filter: UserListFiltersPaginatedDto) {
    return this.userRepository.findAllPaginated(filter);
  }

  async getById(id: string) {
    const user = await this.userRepository.findOne(id);

    if (!user) throw new NotFoundException();

    return user;
  }

  async update(id: string, data: UpdatePasswordDto) {
    const user = await this.userRepository.findOne(id);

    if (!user) throw new NotFoundException();

    const oldPasswordValid = await verifyPassword(
      data.oldPassword,
      user.passwordHash,
    );

    if (!oldPasswordValid) {
      throw new ForbiddenException();
    }

    const newHashedPassword = await hashPassword(data.newPassword);

    return this.userRepository.update(id, {
      passwordHash: newHashedPassword,
    });
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne(id);

    if (!user) throw new NotFoundException();

    return this.userRepository.delete(id);
  }

  async validateUserExist(id: string) {
    const user = await this.userRepository.findOne(id);

    return !!user;
  }

  async validateUserExistWithException(id: string) {
    const exist = await this.validateUserExist(id);

    if (!exist) {
      throw new BadRequestException();
    }
  }
}
