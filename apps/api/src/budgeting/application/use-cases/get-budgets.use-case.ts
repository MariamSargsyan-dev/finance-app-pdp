import { Injectable, Inject } from '@nestjs/common';
import { Budget } from '../../domain/budget.entity';
import { BudgetRepositoryPort } from '../ports/budget.repository.port';

@Injectable()
export class GetBudgetsUseCase {
  constructor(
    @Inject('BudgetRepositoryPort')
    private readonly budgetRepository: BudgetRepositoryPort,
  ) {}

  async execute(userId: string, month?: string): Promise<Budget[]> {
    return this.budgetRepository.findByUserId(userId, month);
  }
}
