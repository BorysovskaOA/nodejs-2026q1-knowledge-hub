import { UpdatePasswordDto } from './dtos/updatePassword.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { CreateUserDto, createUserSchema } from './dtos/createUser.dto';
import { UserService } from './user.service';
import { User } from './interfaces/user.interface';
import { ZodValidationPipe } from 'src/utils/zodValidationPipe';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAll(): User[] {
    return this.userService.getAll();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() createUserDto: CreateUserDto): User {
    // TODO: Add password encryption
    const createdAt = Date.now();
    const user: User = {
      id: crypto.randomUUID(),
      ...createUserDto,
      createdAt,
      updatedAt: createdAt,
    };

    this.userService.create(user);

    return user;
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): User {
    const user = this.userService.getById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): User {
    // TODO: Add password verification and encryption
    const user = this.userService.getById(id);

    if (!user) {
      throw new NotFoundException();
    }

    const updatedUser: User = {
      ...user,
      password: updatePasswordDto.newPassword,
    };

    this.userService.update(id, updatedUser);

    return updatedUser;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    const user = this.userService.getById(id);

    if (!user) {
      throw new NotFoundException();
    }

    this.userService.delete(id);
  }
}
