import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepositoryPort } from '../../../ledger/application/ports/transaction.repository.port';
import { TransactionType } from '../../../shared';

@Injectable()
export class MonthlySummaryUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(userId: string, month: string) {
    const year = parseInt(month.substring(0, 4));
    const monthNum = parseInt(month.substring(5, 7));
    const fromDate = new Date(year, monthNum - 1, 1);
    const toDate = new Date(year, monthNum, 0, 23, 59, 59);

    const transactions = await this.transactionRepository.findByUserId(userId, {
      fromDate,
      toDate,
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.INCOME) {
        totalIncome += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        totalExpense += transaction.amount;
      }
    }

    return {
      month,
      totalIncome,
      totalExpense,
      netCashflow: totalIncome - totalExpense,
    };
  }
}
