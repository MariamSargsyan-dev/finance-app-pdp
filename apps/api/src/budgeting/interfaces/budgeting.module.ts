import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetEntity } from '../infrastructure/budget.entity';
import { BudgetRepository } from '../infrastructure/budget.repository';
import { BudgetsController } from './controllers/budgets.controller';
import { CreateBudgetUseCase } from '../application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../application/use-cases/get-budgets.use-case';
import { UpdateBudgetUseCase } from '../application/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from '../application/use-cases/delete-budget.use-case';
import { LedgerModule } from '../../ledger/interfaces/ledger.module';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetEntity]), LedgerModule],
  controllers: [BudgetsController],
  providers: [
    BudgetRepository,
    {
      provide: 'BudgetRepositoryPort',
      useExisting: BudgetRepository,
    },
    CreateBudgetUseCase,
    GetBudgetsUseCase,
    UpdateBudgetUseCase,
    DeleteBudgetUseCase,
  ],
  exports: [
    BudgetRepository,
    'BudgetRepositoryPort',
  ],
})
export class BudgetingModule {}
