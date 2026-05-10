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
} from '@nestjs/common';
import { CategoryService } from './categoty.service';
import { CreateCategoryDto } from './models/create-category.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
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
import { CategoryEntity } from './models/category.entity';
import {
  ExtendedExceptionResponse,
  GeneralExceptionResponse,
} from 'src/core/utils/exception-responses.util';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';

@ApiBearerAuth('accessToken')
@Controller('category')
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: [CategoryEntity] })
  async getAll(): Promise<CategoryEntity[]> {
    return this.categoryService.getAll();
  }

  @Post()
  @Authorize([{ roles: [UserRole.admin] }])
  @ApiCreatedResponse({ type: CategoryEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  @ApiConflictResponse(ExtendedExceptionResponse(409))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryEntity })
  async getById(@Param() { id }: IdParamDto): Promise<CategoryEntity> {
    return this.categoryService.getById(id);
  }

  @Put(':id')
  @Authorize([{ roles: [UserRole.admin] }])
  @ApiOkResponse({ type: CategoryEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  @ApiConflictResponse(ExtendedExceptionResponse(409))
  async update(
    @Param() { id }: IdParamDto,
    @Body() updateCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Authorize([{ roles: [UserRole.admin] }])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async delete(@Param() { id }: IdParamDto) {
    await this.categoryService.delete(id);
  }
}
