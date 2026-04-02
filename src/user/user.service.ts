import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.interface';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dtos/createUser.dto';
import { hashPassword, verifyPassword } from './utils/passwordHashing';
import { UpdatePasswordDto } from './dtos/updatePassword.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    const userData = {
      ...data,
      password: hashedPassword,
    };
    return this.userRepository.create(userData);
  }

  getAll() {
    return this.userRepository.findAll();
  }

  getById(id: string) {
    const user = this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async update(id: string, data: UpdatePasswordDto) {
    const user = this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    const oldPasswordValid = await verifyPassword(
      data.oldPassword,
      user.password,
    );

    if (!oldPasswordValid) {
      throw new ForbiddenException();
    }

    const newHashedPassword = await hashPassword(data.newPassword);

    return this.userRepository.update(id, { password: newHashedPassword });
  }

  delete(id: string) {
    const user = this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    this.userRepository.delete(id);
  }

  validateUserExist(id: string) {
    const user = this.userRepository.findOne(id);

    return !!user;
  }

  validateUserExistWithException(id: string) {
    const exist = this.validateUserExist(id);

    if (!exist) {
      throw new BadRequestException();
    }
  }
}
