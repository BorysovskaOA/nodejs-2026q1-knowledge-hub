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
import { CategoryService } from './categoty.service';
import { Category } from './interfaces/category.interface';
import { ZodValidationPipe } from 'src/utils/zodValidation.pipe';
import {
  CreateCategoryDto,
  createCategorySchema,
} from './dtos/createCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getAll(): Category[] {
    return this.categoryService.getAll();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createCategorySchema))
  create(@Body() createCategoryDto: CreateCategoryDto): Category {
    const category: Category = {
      id: crypto.randomUUID(),
      ...createCategoryDto,
    };

    this.categoryService.create(category);

    return category;
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Category {
    const category = this.categoryService.getById(id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(createCategorySchema))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: CreateCategoryDto,
  ): Category {
    const category = this.categoryService.getById(id);

    if (!category) {
      throw new NotFoundException();
    }

    const updatedCategory: Category = {
      ...category,
      ...updateCategoryDto,
    };

    this.categoryService.update(id, updatedCategory);

    return updatedCategory;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    const category = this.categoryService.getById(id);

    if (!category) {
      throw new NotFoundException();
    }

    this.categoryService.delete(id);
  }
}
