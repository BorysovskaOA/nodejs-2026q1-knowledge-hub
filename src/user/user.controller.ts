import { UpdatePasswordDto } from './models/update-password.dto';
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
import { CreateUserDto } from './models/create-user.dto';
import { UserService } from './user.service';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import { UserListFiltersPaginatedDto } from './models/user-list-filter.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserEntity } from './models/user.entity';
import { ApiPaginatedResponse } from 'src/core/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';

@ApiBearerAuth('accessToken')
@Controller('user')
@ApiBadRequestResponse({ type: ValidationResponseDto })
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOkResponse({ type: [UserEntity] })
  async getAll(): Promise<UserEntity[]> {
    return this.userService.getAll();
  }

  @Get('paginated')
  @ApiPaginatedResponse(UserEntity)
  async getAllPaginated(
    @Query() filter: UserListFiltersPaginatedDto,
  ): Promise<PaginatedResponseDto<UserEntity>> {
    return this.userService.getAllPaginated(filter);
  }

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async getById(@Param() { id }: IdParamDto): Promise<UserEntity> {
    return this.userService.getById(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: UserEntity })
  async updatePassword(
    @Param() { id }: IdParamDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserEntity> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() { id }: IdParamDto) {
    await this.userService.delete(id);
  }
}
