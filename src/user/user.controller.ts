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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserEntity } from './models/user.entity';
import { ApiPaginatedResponse } from 'src/core/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import {
  GeneralExceptionResponse,
  ExtendedExceptionResponse,
} from 'src/core/utils/exception-responses.util';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';

@ApiBearerAuth('accessToken')
@Controller('user')
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
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
  @Authorize([{ roles: [UserRole.admin] }])
  @ApiCreatedResponse({ type: UserEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  @ApiConflictResponse(ExtendedExceptionResponse(409))
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async getById(@Param() { id }: IdParamDto): Promise<UserEntity> {
    return this.userService.getById(id);
  }

  @Put(':id')
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor, UserRole.viewer],
      constraints: {
        service: UserService,
        paramName: 'id',
        propertyName: 'id',
      },
    },
  ])
  @ApiOkResponse({ type: UserEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async updatePassword(
    @Param() { id }: IdParamDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserEntity> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor, UserRole.viewer],
      constraints: {
        service: UserService,
        paramName: 'id',
        propertyName: 'id',
      },
    },
  ])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async delete(@Param() { id }: IdParamDto) {
    await this.userService.delete(id);
  }
}
