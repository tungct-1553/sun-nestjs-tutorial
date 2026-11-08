import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1783100000000 implements MigrationInterface {
  name = 'CreateCommentsTable1783100000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "comments" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "body" text NOT NULL,
      "article_id" uuid NOT NULL,
      "author_id" uuid NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_comments_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_comments_article_id" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_comments_author_id" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_article_id" ON "comments" ("article_id")`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
