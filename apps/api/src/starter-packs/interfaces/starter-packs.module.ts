import { Module } from '@nestjs/common';
import { StarterPacksController } from './controllers/starter-packs.controller';
import { ApplyStarterPackUseCase } from '../application/apply-starter-pack.use-case';
import { IdentityModule } from '../../identity/interfaces/identity.module';
import { LedgerModule } from '../../ledger/interfaces/ledger.module';
import { BudgetingModule } from '../../budgeting/interfaces/budgeting.module';

@Module({
  imports: [IdentityModule, LedgerModule, BudgetingModule],
  controllers: [StarterPacksController],
  providers: [ApplyStarterPackUseCase],
  exports: [ApplyStarterPackUseCase],
})
export class StarterPacksModule {}
