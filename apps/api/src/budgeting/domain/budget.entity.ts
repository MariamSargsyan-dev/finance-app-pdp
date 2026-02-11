import { randomUUID } from 'crypto';
import { DomainError } from '../../common/errors/domain.error';

export class Budget {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly month: string,
    public readonly categoryId: string,
    public readonly amount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    userId: string,
    month: string,
    categoryId: string,
    amount: number,
  ): Budget {
    if (amount < 0) {
      throw new DomainError('Budget amount must be >= 0');
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new DomainError('Month must be in YYYY-MM format');
    }
    const now = new Date();
    return new Budget(
      randomUUID(),
      userId,
      month,
      categoryId,
      amount,
      now,
      now,
    );
  }
}
