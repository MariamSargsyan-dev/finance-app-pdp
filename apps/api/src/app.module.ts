import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './infrastructure/database/database.module';
import { IdentityModule } from './identity/interfaces/identity.module';
import { LedgerModule } from './ledger/interfaces/ledger.module';
import { BudgetingModule } from './budgeting/interfaces/budgeting.module';
import { ReportingModule } from './reporting/interfaces/reporting.module';
import { StarterPacksModule } from './starter-packs/interfaces/starter-packs.module';
import { validateConfig } from './infrastructure/config/config.validation';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        autoLogging: false,
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
    DatabaseModule,
    IdentityModule,
    LedgerModule,
    BudgetingModule,
    ReportingModule,
    StarterPacksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
