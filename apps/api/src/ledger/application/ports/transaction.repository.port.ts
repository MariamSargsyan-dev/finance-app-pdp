import { Transaction } from '../../domain/transaction.entity';
import { TransactionType } from '../../../shared';

export interface TransactionFilter {
  fromDate?: Date;
  toDate?: Date;
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
}

export interface TransactionRepositoryPort {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string, filter?: TransactionFilter): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
