import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRepoTable1742050995514 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
		CREATE TABLE "repo" (
			"id" SERIAL PRIMARY KEY,
			"gitHub_id" INTEGER NOT NULL UNIQUE,
			"name" VARCHAR(255) NOT NULL,
			"html_url" VARCHAR(255) NOT NULL,
			"description" TEXT,
			"language" VARCHAR(255),
			"stargazers_count" INTEGER NOT NULL
		)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "repo";`);
  }
}
