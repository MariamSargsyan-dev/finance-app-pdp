import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepositoryPort } from '../../../ledger/application/ports/transaction.repository.port';
import { CategoryRepositoryPort } from '../../../ledger/application/ports/category.repository.port';
import { TransactionType } from '../../../shared';

@Injectable()
export class TopCategoriesUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(userId: string, month: string, limit: number = 10) {
    const year = parseInt(month.substring(0, 4));
    const monthNum = parseInt(month.substring(5, 7));
    const fromDate = new Date(year, monthNum - 1, 1);
    const toDate = new Date(year, monthNum, 0, 23, 59, 59);

    const transactions = await this.transactionRepository.findByUserId(userId, {
      fromDate,
      toDate,
      type: TransactionType.EXPENSE,
    });

    const categoryTotals = new Map<string, number>();
    const categoryNames = new Map<string, string>();

    for (const transaction of transactions) {
      if (transaction.categoryId) {
        const current = categoryTotals.get(transaction.categoryId) || 0;
        categoryTotals.set(transaction.categoryId, current + transaction.amount);
      }
    }

    const categoryIds = Array.from(categoryTotals.keys());
    const categories = await Promise.all(
      categoryIds.map((id) => this.categoryRepository.findById(id)),
    );

    for (const category of categories) {
      if (category) {
        categoryNames.set(category.id, category.name);
      }
    }

    const result = Array.from(categoryTotals.entries())
      .map(([categoryId, totalAmount]) => ({
        categoryId,
        categoryName: categoryNames.get(categoryId) || 'Unknown',
        totalAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);

    return result;
  }
}
