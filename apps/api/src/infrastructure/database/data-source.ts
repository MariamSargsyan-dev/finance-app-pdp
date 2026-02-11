import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from '../../identity/infrastructure/user.entity';
import { AccountEntity } from '../../ledger/infrastructure/account.entity';
import { CategoryEntity } from '../../ledger/infrastructure/category.entity';
import { TransactionEntity } from '../../ledger/infrastructure/transaction.entity';
import { BudgetEntity } from '../../budgeting/infrastructure/budget.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    UserEntity,
    AccountEntity,
    CategoryEntity,
    TransactionEntity,
    BudgetEntity,
  ],
  migrations: [__dirname + '/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
});
