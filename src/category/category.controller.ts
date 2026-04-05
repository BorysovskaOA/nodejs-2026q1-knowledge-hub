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
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CategoryEntity } from './models/category.entity';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';

@Controller('category')
@ApiBadRequestResponse({ type: ValidationResponseDto })
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: [CategoryEntity] })
  getAll(): CategoryEntity[] {
    return this.categoryService.getAll();
  }

  @Post()
  @ApiCreatedResponse({ type: CategoryEntity })
  create(@Body() createCategoryDto: CreateCategoryDto): CategoryEntity {
    return this.categoryService.create(createCategoryDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryEntity })
  getById(@Param() { id }: IdParamDto): CategoryEntity {
    return this.categoryService.getById(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: CategoryEntity })
  update(
    @Param() { id }: IdParamDto,
    @Body() updateCategoryDto: CreateCategoryDto,
  ): CategoryEntity {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() { id }: IdParamDto) {
    this.categoryService.delete(id);
  }
}
