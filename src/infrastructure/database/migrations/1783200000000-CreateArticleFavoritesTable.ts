import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticleFavoritesTable1783200000000 implements MigrationInterface {
  name = 'CreateArticleFavoritesTable1783200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "article_favorites" (
      "article_id" uuid NOT NULL,
      "user_id" uuid NOT NULL,
      CONSTRAINT "PK_article_favorites" PRIMARY KEY ("article_id", "user_id"),
      CONSTRAINT "FK_favorites_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_favorites_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      'CREATE INDEX "IDX_favorites_user_id" ON "article_favorites" ("user_id")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "article_favorites"');
  }
}
