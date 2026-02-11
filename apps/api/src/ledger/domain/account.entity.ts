import { randomUUID } from 'crypto';
import { AccountType } from '../../shared';

export class Account {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly type: AccountType,
    public readonly currency: string,
    public readonly balance: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    userId: string,
    name: string,
    type: AccountType,
    currency: string,
  ): Account {
    const now = new Date();
    return new Account(
      randomUUID(),
      userId,
      name.trim(),
      type,
      currency.toUpperCase().trim(),
      0,
      now,
      now,
    );
  }

  updateBalance(newBalance: number): Account {
    return new Account(
      this.id,
      this.userId,
      this.name,
      this.type,
      this.currency,
      newBalance,
      this.createdAt,
      new Date(),
    );
  }
}
