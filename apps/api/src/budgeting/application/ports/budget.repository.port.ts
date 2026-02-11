import { Budget } from '../../domain/budget.entity';

export interface BudgetRepositoryPort {
  save(budget: Budget): Promise<Budget>;
  findById(id: string): Promise<Budget | null>;
  findByUserId(userId: string, month?: string): Promise<Budget[]>;
  findByMonthAndCategory(
    userId: string,
    month: string,
    categoryId: string,
  ): Promise<Budget | null>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;
}
