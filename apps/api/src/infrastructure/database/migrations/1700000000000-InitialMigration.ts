import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "account_type_enum" AS ENUM('cash', 'bank', 'card');
    `);

    await queryRunner.query(`
      CREATE TYPE "category_type_enum" AS ENUM('income', 'expense');
    `);

    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM('income', 'expense', 'transfer');
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "type" "account_type_enum" NOT NULL,
        "currency" character varying NOT NULL,
        "balance" decimal(15,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_accounts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "type" "category_type_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_categories_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "transaction_type_enum" NOT NULL,
        "accountId" uuid NOT NULL,
        "toAccountId" uuid,
        "categoryId" uuid,
        "amount" decimal(15,2) NOT NULL,
        "date" date NOT NULL,
        "note" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_accountId" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_toAccountId" FOREIGN KEY ("toAccountId") REFERENCES "accounts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "budgets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "month" character varying NOT NULL,
        "categoryId" uuid NOT NULL,
        "amount" decimal(15,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_budgets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_budgets_userId_month_categoryId" UNIQUE ("userId", "month", "categoryId"),
        CONSTRAINT "FK_budgets_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_budgets_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_userId" ON "accounts" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_categories_userId" ON "categories" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_userId" ON "transactions" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_accountId" ON "transactions" ("accountId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_date" ON "transactions" ("date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_budgets_userId" ON "budgets" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_budgets_month" ON "budgets" ("month")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_budgets_month"`);
    await queryRunner.query(`DROP INDEX "IDX_budgets_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_date"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_accountId"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_accounts_userId"`);
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "category_type_enum"`);
    await queryRunner.query(`DROP TYPE "account_type_enum"`);
  }
}
