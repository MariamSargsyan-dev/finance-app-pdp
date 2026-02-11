import { Injectable, Inject } from '@nestjs/common';
import { Category } from '../../../domain/category.entity';
import { CategoryRepositoryPort } from '../../ports/category.repository.port';

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Category[]> {
    return this.categoryRepository.findByUserId(userId);
  }
}
