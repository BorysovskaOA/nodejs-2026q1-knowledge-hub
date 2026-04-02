import {
  UpdatePasswordDto,
  updatePassworSchema,
} from './dtos/updatePassword.dto';
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
  UsePipes,
} from '@nestjs/common';
import { CreateUserDto, createUserSchema } from './dtos/createUser.dto';
import { UserService } from './user.service';
import { User } from './user.interface';
import { ZodValidationPipe } from 'src/utils/zodValidation.pipe';
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
  @UsePipes(new ZodValidationPipe(createUserSchema))
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
    @Body(new ZodValidationPipe(updatePassworSchema))
    updatePasswordDto: UpdatePasswordDto,
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
