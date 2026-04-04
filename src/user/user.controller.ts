import { UpdatePasswordDto } from './dtos/update-password.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { User } from './user.interface';
import { UseResponseMapper } from 'src/core/decorators/use-response-mapper.decorator';
import { UserMapper } from './user.mapper';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import { UserListFiltersPaginatedDto } from './dtos/user-list-filter.dto';
import { PaginatedResponse } from 'src/core/interfaces/paginated-response.interface';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseResponseMapper(UserMapper)
  getAll(): User[] {
    return this.userService.getAll();
  }

  @Get('paginated')
  @UseResponseMapper(UserMapper)
  getAllPaginated(
    @Query() filter: UserListFiltersPaginatedDto,
  ): PaginatedResponse<User> {
    return this.userService.getAllPaginated(filter);
  }

  @Post()
  @UseResponseMapper(UserMapper)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  @UseResponseMapper(UserMapper)
  getById(@Param() { id }: IdParamDto): User {
    return this.userService.getById(id);
  }

  @Put(':id')
  @UseResponseMapper(UserMapper)
  async updatePassword(
    @Param() { id }: IdParamDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    return this.userService.update(id, updatePasswordDto);
  }

  @Delete(':id')
  @UseResponseMapper(UserMapper)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() { id }: IdParamDto) {
    this.userService.delete(id);
  }
}
