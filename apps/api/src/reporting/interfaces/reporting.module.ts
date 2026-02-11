import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { MonthlySummaryUseCase } from '../application/use-cases/monthly-summary.use-case';
import { TopCategoriesUseCase } from '../application/use-cases/top-categories.use-case';
import { DailyCashflowUseCase } from '../application/use-cases/daily-cashflow.use-case';
import { LedgerModule } from '../../ledger/interfaces/ledger.module';

@Module({
  imports: [LedgerModule],
  controllers: [ReportsController],
  providers: [
    MonthlySummaryUseCase,
    TopCategoriesUseCase,
    DailyCashflowUseCase,
  ],
})
export class ReportingModule {}
