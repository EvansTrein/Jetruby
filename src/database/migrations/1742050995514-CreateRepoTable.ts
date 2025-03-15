import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRepoTable1742050995514 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "repo" (
        "id" SERIAL PRIMARY KEY,
        "gitHub_id" integer NOT NULL,
				"name" character varying NOT NULL,
        "html_url" character varying NOT NULL,
        "description" character varying NOT NULL,
        "language" character varying,
        "stargazers_count" integer NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_REPO_GITHUB_ID" ON "repo" ("gitHub_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "repo"`);
  }
}
