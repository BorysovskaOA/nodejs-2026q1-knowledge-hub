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
import { Category } from './category.interface';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getAll(): Category[] {
    return this.categoryService.getAll();
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto): Category {
    return this.categoryService.create(createCategoryDto);
  }

  @Get(':id')
  getById(@Param() { id }: IdParamDto): Category {
    return this.categoryService.getById(id);
  }

  @Put(':id')
  update(
    @Param() { id }: IdParamDto,
    @Body() updateCategoryDto: CreateCategoryDto,
  ): Category | undefined {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() { id }: IdParamDto) {
    return this.categoryService.delete(id);
  }
}
