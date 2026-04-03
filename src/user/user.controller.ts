import { UpdatePasswordDto } from './dtos/updatePassword.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/createUser.dto';
import { UserService } from './user.service';
import { User } from './user.interface';
import { UseResponseMapper } from 'src/utils/useResponseMapper.decorator';
import { UserMapper } from './user.mapper';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseResponseMapper(UserMapper)
  getAll(): User[] {
    return this.userService.getAll();
  }

  @Post()
  @UseResponseMapper(UserMapper)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  @UseResponseMapper(UserMapper)
  getById(@Param('id', ParseUUIDPipe) id: string): User {
    return this.userService.getById(id);
  }

  @Put(':id')
  @UseResponseMapper(UserMapper)
  async updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    return this.userService.update(id, updatePasswordDto);
  }

  @Delete(':id')
  @UseResponseMapper(UserMapper)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
