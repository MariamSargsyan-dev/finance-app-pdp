import { Injectable, Inject } from '@nestjs/common';
import { AccountType, CategoryType } from '../../shared';
import { getStarterPack, PackKey } from '../../seed/starter-packs';
import { UserRepositoryPort } from '../../identity/application/ports/user.repository.port';
import { AccountRepositoryPort } from '../../ledger/application/ports/account.repository.port';
import { CategoryRepositoryPort } from '../../ledger/application/ports/category.repository.port';
import { BudgetRepositoryPort } from '../../budgeting/application/ports/budget.repository.port';
import { Account } from '../../ledger/domain/account.entity';
import { Category } from '../../ledger/domain/category.entity';
import { Budget } from '../../budgeting/domain/budget.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ApplyStarterPackUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
    @Inject('BudgetRepositoryPort')
    private readonly budgetRepository: BudgetRepositoryPort,
  ) {}

  async execute(userId: string, packKey: PackKey): Promise<{ applied: boolean }> {
    const pack = getStarterPack(packKey);
    if (!pack) {
      throw new Error(`Unknown pack: ${packKey}`);
    }

    if (pack.key !== 'empty') {
      for (const acc of pack.accounts) {
        const existing = await this.accountRepository.findOneByOwnerAndName(
          userId,
          acc.name,
        );
        if (!existing) {
          const account = new Account(
            randomUUID(),
            userId,
            acc.name,
            acc.type as AccountType,
            acc.currency,
            0,
            new Date(),
            new Date(),
          );
          await this.accountRepository.save(account);
        }
      }

      for (const cat of pack.categories) {
        const existing =
          await this.categoryRepository.findOneByOwnerTypeAndName(
            userId,
            cat.type as CategoryType,
            cat.name,
          );
        if (!existing) {
          const category = new Category(
            randomUUID(),
            userId,
            cat.name,
            cat.type as CategoryType,
            new Date(),
            new Date(),
          );
          await this.categoryRepository.save(category);
        }
      }

      if (pack.budgets && pack.budgets.length > 0) {
        const categories = await this.categoryRepository.findByUserId(userId);
        const month = new Date().toISOString().slice(0, 7);

        for (const b of pack.budgets) {
          const cat = categories.find(
            (c) => c.name === b.categoryName && c.type === 'expense',
          );
          if (!cat) continue;

          const existing = await this.budgetRepository.findByMonthAndCategory(
            userId,
            month,
            cat.id,
          );
          if (!existing) {
            const budget = new Budget(
              randomUUID(),
              userId,
              month,
              cat.id,
              b.amount,
              new Date(),
              new Date(),
            );
            await this.budgetRepository.save(budget);
          }
        }
      }
    }

    await this.userRepository.setOnboardingCompleted(userId);
    return { applied: true };
  }
}
