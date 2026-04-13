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
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CategoryEntity } from './models/category.entity';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';

@ApiBearerAuth('accessToken')
@Controller('category')
@ApiBadRequestResponse({ type: ValidationResponseDto })
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: [CategoryEntity] })
  async getAll(): Promise<CategoryEntity[]> {
    return this.categoryService.getAll();
  }

  @Post()
  @ApiCreatedResponse({ type: CategoryEntity })
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
  @ApiOkResponse({ type: CategoryEntity })
  async update(
    @Param() { id }: IdParamDto,
    @Body() updateCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() { id }: IdParamDto) {
    await this.categoryService.delete(id);
  }
}
