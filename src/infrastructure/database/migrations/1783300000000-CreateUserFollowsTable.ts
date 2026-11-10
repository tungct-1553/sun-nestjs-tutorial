import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFollowsTable1783300000000 implements MigrationInterface {
  name = 'CreateUserFollowsTable1783300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user_follows" (
      "follower_id" uuid NOT NULL,
      "followed_id" uuid NOT NULL,
      CONSTRAINT "PK_user_follows" PRIMARY KEY ("follower_id", "followed_id"),
      CONSTRAINT "CHK_user_follows_not_self" CHECK ("follower_id" <> "followed_id"),
      CONSTRAINT "FK_user_follows_follower" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_user_follows_followed" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      'CREATE INDEX "IDX_user_follows_followed" ON "user_follows" ("followed_id")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "user_follows"');
  }
}
