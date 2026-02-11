import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Transaction } from '../../../domain/transaction.entity';
import { TransactionRepositoryPort } from '../../ports/transaction.repository.port';
import { AccountRepositoryPort } from '../../ports/account.repository.port';
import { CategoryRepositoryPort } from '../../ports/category.repository.port';
import { TransactionType, CategoryType } from '../../../../shared';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(
    userId: string,
    type: TransactionType,
    accountId: string,
    toAccountId: string | undefined,
    categoryId: string | undefined,
    amount: number,
    date: Date,
    note: string | null,
  ): Promise<Transaction> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (type === TransactionType.TRANSFER) {
      if (!toAccountId) {
        throw new BadRequestException('Transfer requires toAccountId');
      }
      const toAccount = await this.accountRepository.findById(toAccountId);
      if (!toAccount) {
        throw new NotFoundException('To account not found');
      }
      if (toAccount.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
      if (account.currency !== toAccount.currency) {
        throw new BadRequestException('Transfer accounts must have same currency');
      }

      const transaction = Transaction.createTransfer(
        userId,
        accountId,
        toAccountId,
        amount,
        date,
        note,
      );

      const saved = await this.transactionRepository.save(transaction);

      const updatedFromAccount = account.updateBalance(account.balance - amount);
      const updatedToAccount = toAccount.updateBalance(toAccount.balance + amount);

      await this.accountRepository.update(updatedFromAccount);
      await this.accountRepository.update(updatedToAccount);

      return saved;
    } else {
      if (!categoryId) {
        throw new BadRequestException('Category is required for income/expense');
      }
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      if (category.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      const expectedCategoryType =
        type === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
      if (category.type !== expectedCategoryType) {
        throw new BadRequestException(
          `Category type must match transaction type: ${expectedCategoryType}`,
        );
      }

      let transaction: Transaction;
      if (type === TransactionType.INCOME) {
        transaction = Transaction.createIncome(
          userId,
          accountId,
          categoryId,
          amount,
          date,
          note,
        );
      } else {
        transaction = Transaction.createExpense(
          userId,
          accountId,
          categoryId,
          amount,
          date,
          note,
        );
      }

      const saved = await this.transactionRepository.save(transaction);

      const balanceChange = type === TransactionType.INCOME ? amount : -amount;
      const updatedAccount = account.updateBalance(account.balance + balanceChange);
      await this.accountRepository.update(updatedAccount);

      return saved;
    }
  }
}
