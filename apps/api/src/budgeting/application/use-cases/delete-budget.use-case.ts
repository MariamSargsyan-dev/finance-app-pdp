import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { BudgetRepositoryPort } from '../ports/budget.repository.port';

@Injectable()
export class DeleteBudgetUseCase {
  constructor(
    @Inject('BudgetRepositoryPort')
    private readonly budgetRepository: BudgetRepositoryPort,
  ) {}

  async execute(userId: string, budgetId: string): Promise<void> {
    const budget = await this.budgetRepository.findById(budgetId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    if (budget.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.budgetRepository.delete(budgetId);
  }
}
