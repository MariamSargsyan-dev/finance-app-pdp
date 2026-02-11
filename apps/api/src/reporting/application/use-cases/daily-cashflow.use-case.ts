import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepositoryPort } from '../../../ledger/application/ports/transaction.repository.port';
import { TransactionType } from '../../../shared';

@Injectable()
export class DailyCashflowUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(userId: string, fromDate: Date, toDate: Date) {
    const transactions = await this.transactionRepository.findByUserId(userId, {
      fromDate,
      toDate,
    });

    const dailyTotals = new Map<string, { income: number; expense: number }>();

    for (const transaction of transactions) {
      const date = transaction.date instanceof Date 
        ? transaction.date 
        : new Date(transaction.date);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyTotals.has(dateKey)) {
        dailyTotals.set(dateKey, { income: 0, expense: 0 });
      }

      const dayTotal = dailyTotals.get(dateKey)!;
      if (transaction.type === TransactionType.INCOME) {
        dayTotal.income += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        dayTotal.expense += transaction.amount;
      }
    }

    const result = Array.from(dailyTotals.entries())
      .map(([date, totals]) => ({
        date,
        totalIncome: totals.income,
        totalExpense: totals.expense,
        netCashflow: totals.income - totals.expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }
}
