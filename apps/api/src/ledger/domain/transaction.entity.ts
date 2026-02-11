import { randomUUID } from 'crypto';
import { TransactionType } from '../../shared';
import { DomainError } from '../../common/errors/domain.error';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: TransactionType,
    public readonly accountId: string,
    public readonly toAccountId: string | null,
    public readonly categoryId: string | null,
    public readonly amount: number,
    public readonly date: Date,
    public readonly note: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static createIncome(
    userId: string,
    accountId: string,
    categoryId: string,
    amount: number,
    date: Date,
    note: string | null,
  ): Transaction {
    if (amount <= 0) {
      throw new DomainError('Amount must be greater than 0');
    }
    const now = new Date();
    return new Transaction(
      randomUUID(),
      userId,
      TransactionType.INCOME,
      accountId,
      null,
      categoryId,
      amount,
      date,
      note,
      now,
      now,
    );
  }

  static createExpense(
    userId: string,
    accountId: string,
    categoryId: string,
    amount: number,
    date: Date,
    note: string | null,
  ): Transaction {
    if (amount <= 0) {
      throw new DomainError('Amount must be greater than 0');
    }
    const now = new Date();
    return new Transaction(
      randomUUID(),
      userId,
      TransactionType.EXPENSE,
      accountId,
      null,
      categoryId,
      amount,
      date,
      note,
      now,
      now,
    );
  }

  static createTransfer(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: Date,
    note: string | null,
  ): Transaction {
    if (amount <= 0) {
      throw new DomainError('Amount must be greater than 0');
    }
    if (fromAccountId === toAccountId) {
      throw new DomainError('Transfer accounts must be different');
    }
    const now = new Date();
    return new Transaction(
      randomUUID(),
      userId,
      TransactionType.TRANSFER,
      fromAccountId,
      toAccountId,
      null,
      amount,
      date,
      note,
      now,
      now,
    );
  }
}
