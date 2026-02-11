import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UserEntity } from '../../identity/infrastructure/user.entity';
import { AccountEntity } from '../../ledger/infrastructure/account.entity';
import { CategoryEntity } from '../../ledger/infrastructure/category.entity';
import { TransactionEntity } from '../../ledger/infrastructure/transaction.entity';
import { BudgetEntity } from '../../budgeting/infrastructure/budget.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [
          UserEntity,
          AccountEntity,
          CategoryEntity,
          TransactionEntity,
          BudgetEntity,
        ],
        synchronize: false,
        migrationsRun: true,
        migrations: [join(__dirname, 'migrations/*.js')],
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
