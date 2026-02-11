import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { TransactionRepositoryPort } from '../../ports/transaction.repository.port';
import { AccountRepositoryPort } from '../../ports/account.repository.port';
import { TransactionType } from '../../../../shared';

@Injectable()
export class DeleteTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async execute(userId: string, transactionId: string): Promise<void> {
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
    if (transaction.type === TransactionType.INCOME) {
      balanceAdjustment = -transaction.amount;
    } else if (transaction.type === TransactionType.EXPENSE) {
      balanceAdjustment = transaction.amount;
    } else if (transaction.type === TransactionType.TRANSFER) {
      const toAccount = await this.accountRepository.findById(
        transaction.toAccountId!,
      );
      if (!toAccount) {
        throw new NotFoundException('To account not found');
      }

      const updatedFromAccount = account.updateBalance(
        account.balance + transaction.amount,
      );
      const updatedToAccount = toAccount.updateBalance(
        toAccount.balance - transaction.amount,
      );

      await this.accountRepository.update(updatedFromAccount);
      await this.accountRepository.update(updatedToAccount);
    }

    await this.transactionRepository.delete(transactionId);

    if (transaction.type !== TransactionType.TRANSFER && balanceAdjustment !== 0) {
      const updatedAccount = account.updateBalance(
        account.balance + balanceAdjustment,
      );
      await this.accountRepository.update(updatedAccount);
    }
  }
}
