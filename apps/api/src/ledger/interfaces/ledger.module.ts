import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../infrastructure/account.entity';
import { CategoryEntity } from '../infrastructure/category.entity';
import { TransactionEntity } from '../infrastructure/transaction.entity';
import { AccountRepository } from '../infrastructure/account.repository';
import { CategoryRepository } from '../infrastructure/category.repository';
import { TransactionRepository } from '../infrastructure/transaction.repository';
import { AccountsController } from './controllers/accounts.controller';
import { CategoriesController } from './controllers/categories.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { CreateAccountUseCase } from '../application/use-cases/accounts/create-account.use-case';
import { GetAccountsUseCase } from '../application/use-cases/accounts/get-accounts.use-case';
import { UpdateAccountUseCase } from '../application/use-cases/accounts/update-account.use-case';
import { DeleteAccountUseCase } from '../application/use-cases/accounts/delete-account.use-case';
import { CreateCategoryUseCase } from '../application/use-cases/categories/create-category.use-case';
import { GetCategoriesUseCase } from '../application/use-cases/categories/get-categories.use-case';
import { UpdateCategoryUseCase } from '../application/use-cases/categories/update-category.use-case';
import { DeleteCategoryUseCase } from '../application/use-cases/categories/delete-category.use-case';
import { CreateTransactionUseCase } from '../application/use-cases/transactions/create-transaction.use-case';
import { GetTransactionsUseCase } from '../application/use-cases/transactions/get-transactions.use-case';
import { UpdateTransactionUseCase } from '../application/use-cases/transactions/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../application/use-cases/transactions/delete-transaction.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, CategoryEntity, TransactionEntity]),
  ],
  controllers: [AccountsController, CategoriesController, TransactionsController],
  providers: [
    AccountRepository,
    {
      provide: 'AccountRepositoryPort',
      useExisting: AccountRepository,
    },
    CategoryRepository,
    {
      provide: 'CategoryRepositoryPort',
      useExisting: CategoryRepository,
    },
    TransactionRepository,
    {
      provide: 'TransactionRepositoryPort',
      useExisting: TransactionRepository,
    },
    CreateAccountUseCase,
    GetAccountsUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
    CreateCategoryUseCase,
    GetCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    CreateTransactionUseCase,
    GetTransactionsUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
  ],
  exports: [
    AccountRepository,
    CategoryRepository,
    TransactionRepository,
    'AccountRepositoryPort',
    'CategoryRepositoryPort',
    'TransactionRepositoryPort',
  ],
})
export class LedgerModule {}
