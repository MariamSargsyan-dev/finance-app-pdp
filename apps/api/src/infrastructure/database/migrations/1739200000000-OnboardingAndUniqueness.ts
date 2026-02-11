import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnboardingAndUniqueness1739200000000 implements MigrationInterface {
  name = 'OnboardingAndUniqueness1739200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "onboardingCompleted" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_accounts_userId_name"
      ON "accounts" ("userId", "name")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_categories_userId_type_name"
      ON "categories" ("userId", "type", "name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_categories_userId_type_name"`);
    await queryRunner.query(`DROP INDEX "UQ_accounts_userId_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onboardingCompleted"`);
  }
}
