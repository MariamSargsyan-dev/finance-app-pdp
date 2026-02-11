import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CategoryRepositoryPort } from '../../ports/category.repository.port';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(
    userId: string,
    categoryId: string,
    name: string,
  ): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = new (category.constructor as any)(
      category.id,
      category.userId,
      name,
      category.type,
      category.createdAt,
      new Date(),
    );
    await this.categoryRepository.update(updated);
  }
}
