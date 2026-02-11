import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { BudgetRepositoryPort } from '../ports/budget.repository.port';

@Injectable()
export class UpdateBudgetUseCase {
  constructor(
    @Inject('BudgetRepositoryPort')
    private readonly budgetRepository: BudgetRepositoryPort,
  ) {}

  async execute(
    userId: string,
    budgetId: string,
    amount: number,
  ): Promise<void> {
    const budget = await this.budgetRepository.findById(budgetId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    if (budget.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = new (budget.constructor as any)(
      budget.id,
      budget.userId,
      budget.month,
      budget.categoryId,
      amount,
      budget.createdAt,
      new Date(),
    );
    await this.budgetRepository.update(updated);
  }
}
