import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './models/create-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async create(data: CreateCategoryDto) {
    return this.categoryRepository.create(data);
  }

  async getAll() {
    return this.categoryRepository.findAll();
  }

  async getById(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) throw new NotFoundException();

    return category;
  }

  async getOne(where: Prisma.CategoryWhereUniqueInput) {
    return await this.categoryRepository.findOne(where);
  }

  async update(id: string, data: CreateCategoryDto) {
    const category = await this.getById(id);

    return this.categoryRepository.update(category.id, data);
  }

  async delete(id: string) {
    const category = await this.getById(id);

    return this.categoryRepository.delete(category.id);
  }

  async validateCategoryExist(id: string) {
    const user = await this.categoryRepository.findById(id);

    return !!user;
  }

  async validateCategoryExistWithException(id: string) {
    const exist = await this.validateCategoryExist(id);

    if (!exist) throw new BadRequestException();
  }
}
