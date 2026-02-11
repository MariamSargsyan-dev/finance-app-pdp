import { Injectable, Inject } from '@nestjs/common';
import { Category } from '../../../domain/category.entity';
import { CategoryRepositoryPort } from '../../ports/category.repository.port';
import { CategoryType } from '../../../../shared';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(
    userId: string,
    name: string,
    type: CategoryType,
  ): Promise<Category> {
    const category = Category.create(userId, name, type);
    return this.categoryRepository.save(category);
  }
}
