import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CategoryRepositoryPort } from '../../ports/category.repository.port';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(userId: string, categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.categoryRepository.delete(categoryId);
  }
}
