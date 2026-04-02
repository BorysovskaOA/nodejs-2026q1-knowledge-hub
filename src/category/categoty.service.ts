import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dtos/createCategory.dto';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    @Inject(forwardRef(() => ArticleService))
    private articleService: ArticleService,
  ) {}

  create(data: CreateCategoryDto) {
    return this.categoryRepository.create(data);
  }

  getAll() {
    return this.categoryRepository.findAll();
  }

  getById(id: string) {
    const category = this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  update(id: string, data: CreateCategoryDto) {
    const category = this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException();
    }

    return this.categoryRepository.update(id, data);
  }

  delete(id: string) {
    const category = this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException();
    }

    const result = this.categoryRepository.delete(id);

    this.articleService.unsetArticleCategoryId(id);

    return result;
  }

  validateCategoryExist(id: string) {
    const user = this.categoryRepository.findOne(id);

    return !!user;
  }

  validateCategoryExistWithException(id: string) {
    const exist = this.validateCategoryExist(id);

    if (!exist) {
      throw new BadRequestException();
    }
  }
}
