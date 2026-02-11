import { Injectable, Inject } from '@nestjs/common';
import { Transaction } from '../../../domain/transaction.entity';
import {
  TransactionRepositoryPort,
  TransactionFilter,
} from '../../ports/transaction.repository.port';

@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(userId: string, filter?: TransactionFilter): Promise<Transaction[]> {
    return this.transactionRepository.findByUserId(userId, filter);
  }
}
