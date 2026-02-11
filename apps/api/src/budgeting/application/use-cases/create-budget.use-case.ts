import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Budget } from '../../domain/budget.entity';
import { BudgetRepositoryPort } from '../ports/budget.repository.port';
import { CategoryRepositoryPort } from '../../../ledger/application/ports/category.repository.port';

@Injectable()
export class CreateBudgetUseCase {
  constructor(
    @Inject('BudgetRepositoryPort')
    private readonly budgetRepository: BudgetRepositoryPort,
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(
    userId: string,
    month: string,
    categoryId: string,
    amount: number,
  ): Promise<Budget> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const existing = await this.budgetRepository.findByMonthAndCategory(
      userId,
      month,
      categoryId,
    );
    if (existing) {
      throw new ConflictException(
        'Budget already exists for this month and category',
      );
    }

    const budget = Budget.create(userId, month, categoryId, amount);
    return this.budgetRepository.save(budget);
  }
}
