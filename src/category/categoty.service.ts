import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dtos/create-category.dto';
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

    const updatedCategory = this.categoryRepository.update(id, data);
    if (!updatedCategory) {
      throw new InternalServerErrorException();
    }

    return updatedCategory;
  }

  delete(id: string) {
    const category = this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException();
    }

    const result = this.categoryRepository.delete(id);

    this.articleService.unsetArticleCategory(id);

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
