import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { TransactionRepositoryPort } from '../../ports/transaction.repository.port';
import { AccountRepositoryPort } from '../../ports/account.repository.port';
import { Transaction } from '../../../domain/transaction.entity';
import { TransactionType } from '../../../../shared';

@Injectable()
export class UpdateTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async execute(
    userId: string,
    transactionId: string,
    amount?: number,
    date?: Date,
    note?: string,
  ): Promise<void> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const account = await this.accountRepository.findById(transaction.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let balanceAdjustment = 0;
    const oldAmount = transaction.amount;
    const newAmount = amount ?? oldAmount;

    if (transaction.type === TransactionType.INCOME) {
      balanceAdjustment = newAmount - oldAmount;
    } else if (transaction.type === TransactionType.EXPENSE) {
      balanceAdjustment = -(newAmount - oldAmount);
    } else {
      throw new BadRequestException('Transfer transactions cannot be updated');
    }

    const updated = new Transaction(
      transaction.id,
      transaction.userId,
      transaction.type,
      transaction.accountId,
      transaction.toAccountId,
      transaction.categoryId,
      newAmount,
      date ?? transaction.date,
      note ?? transaction.note,
      transaction.createdAt,
      new Date(),
    );

    await this.transactionRepository.update(updated);

    if (balanceAdjustment !== 0) {
      const updatedAccount = account.updateBalance(
        account.balance + balanceAdjustment,
      );
      await this.accountRepository.update(updatedAccount);
    }
  }
}
