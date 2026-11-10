import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReserveArticleFeedSlug1783400000000 implements MigrationInterface {
  name = 'ReserveArticleFeedSlug1783400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // TypeORM runs migrations in a transaction; block concurrent writers while
    // relocating an existing slug and adding the permanent constraint.
    await queryRunner.query(
      'LOCK TABLE "articles" IN SHARE ROW EXCLUSIVE MODE',
    );
    const existing = (await queryRunner.query(
      'SELECT id FROM articles WHERE slug = $1',
      ['feed'],
    )) as { id: string }[];
    if (existing.length > 0) {
      let suffix = 2;
      let candidate = `feed-${suffix}`;
      let taken = (await queryRunner.query(
        'SELECT id FROM articles WHERE slug = $1',
        [candidate],
      )) as { id: string }[];
      while (taken.length > 0) {
        suffix += 1;
        candidate = `feed-${suffix}`;
        taken = (await queryRunner.query(
          'SELECT id FROM articles WHERE slug = $1',
          [candidate],
        )) as { id: string }[];
      }
      await queryRunner.query('UPDATE articles SET slug = $1 WHERE id = $2', [
        candidate,
        existing[0].id,
      ]);
    }
    await queryRunner.query(
      'ALTER TABLE "articles" ADD CONSTRAINT "CHK_articles_slug_not_feed" CHECK ("slug" <> \'feed\')',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "articles" DROP CONSTRAINT "CHK_articles_slug_not_feed"',
    );
    // Preserve the relocated slug: its previous URL cannot be identified safely.
  }
}
