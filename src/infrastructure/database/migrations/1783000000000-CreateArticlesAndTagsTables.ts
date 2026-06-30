import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesAndTagsTables1783000000000
  implements MigrationInterface
{
  name = 'CreateArticlesAndTagsTables1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "PK_tags_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" character varying NOT NULL,
        "body" text NOT NULL,
        "author_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_articles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_articles_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_articles_author_id" FOREIGN KEY ("author_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "article_tags" (
        "article_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_article_tags" PRIMARY KEY ("article_id", "tag_id"),
        CONSTRAINT "FK_article_tags_article_id" FOREIGN KEY ("article_id")
          REFERENCES "articles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_article_tags_tag_id" FOREIGN KEY ("tag_id")
          REFERENCES "tags"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_articles_author_id" ON "articles" ("author_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_articles_author_id"`);
    await queryRunner.query(`DROP TABLE "article_tags"`);
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}