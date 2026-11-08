import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { CreateArticleFavoritesTable1783200000000 } from '@infrastructure/database/migrations/1783200000000-CreateArticleFavoritesTable';
import { ArticleEntity } from '@infrastructure/entities/article.entity';
import { TagEntity } from '@infrastructure/entities/tag.entity';
import { UserEntity } from '@infrastructure/entities/user.entity';
import { ArticleRepository } from '@infrastructure/repositories/article.repository';

const databaseUrl = process.env.ARTICLE_TEST_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

describeWithDatabase('ArticleRepository tag filtering (PostgreSQL)', () => {
  const schema = `articles_test_${randomUUID().replaceAll('-', '')}`;
  let admin: DataSource;
  let dataSource: DataSource;

  beforeAll(async () => {
    admin = await new DataSource({
      type: 'postgres',
      url: databaseUrl,
    }).initialize();
    await admin.query(`CREATE SCHEMA "${schema}"`);
    dataSource = await new DataSource({
      type: 'postgres',
      url: databaseUrl,
      schema,
      entities: [UserEntity, ArticleEntity, TagEntity],
      synchronize: true,
    }).initialize();
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.query(`SET search_path TO "${schema}", public`);
    await new CreateArticleFavoritesTable1783200000000().up(runner);
    await runner.release();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    if (admin?.isInitialized) {
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
      await admin.destroy();
    }
  });

  it('retains every article tag when filtering by one tag', async () => {
    const users = dataSource.getRepository(UserEntity);
    const user = await users.save(
      users.create({
        email: 'author@example.test',
        username: 'author',
        password: 'unused',
      }),
    );
    const repository = new ArticleRepository(
      dataSource.getRepository(ArticleEntity),
      dataSource.getRepository(TagEntity),
    );
    await repository.create({
      slug: 'article',
      title: 'Article',
      description: 'Description',
      body: 'Body',
      authorId: user.id,
      tagList: ['nestjs', 'typescript'],
    });
    await repository.create({
      slug: 'other',
      title: 'Other',
      description: 'Description',
      body: 'Body',
      authorId: user.id,
      tagList: ['other'],
    });

    const filters = { tag: 'nestjs', limit: 20, offset: 0 };
    const articles = await repository.findMany(filters);
    expect(await repository.count(filters)).toBe(1);
    expect(articles).toHaveLength(1);
    expect(articles[0]?.slug).toBe('article');
    expect(articles[0]?.tagList.sort()).toEqual(['nestjs', 'typescript']);
  });

  it('keeps favorites unique, returns viewer state, and filters without losing tags', async () => {
    const users = dataSource.getRepository(UserEntity);
    const author = await users.save(
      users.create({
        email: 'f-author@example.test',
        username: 'favorite-author',
        password: 'unused',
      }),
    );
    const alice = await users.save(
      users.create({
        email: 'alice@example.test',
        username: 'alice',
        password: 'unused',
      }),
    );
    const bob = await users.save(
      users.create({
        email: 'bob@example.test',
        username: 'bob',
        password: 'unused',
      }),
    );
    const repository = new ArticleRepository(
      dataSource.getRepository(ArticleEntity),
      dataSource.getRepository(TagEntity),
    );
    const first = await repository.create({
      slug: 'favorite-first',
      title: 'First',
      description: 'Description',
      body: 'Body',
      authorId: author.id,
      tagList: ['favorite-tag', 'second-tag'],
    });
    const second = await repository.create({
      slug: 'favorite-second',
      title: 'Second',
      description: 'Description',
      body: 'Body',
      authorId: author.id,
      tagList: ['favorite-tag'],
    });
    await Promise.all([
      repository.addFavorite(first.id, alice.id),
      repository.addFavorite(first.id, alice.id),
    ]);
    await repository.addFavorite(first.id, bob.id);
    await repository.addFavorite(second.id, alice.id);
    expect(await repository.findBySlug(first.slug, alice.id)).toMatchObject({
      favorited: true,
      favoritesCount: 2,
    });
    expect(await repository.findBySlug(first.slug)).toMatchObject({
      favorited: false,
      favoritesCount: 2,
    });
    const filters = {
      favorited: 'alice',
      tag: 'favorite-tag',
      limit: 1,
      offset: 0,
      viewerId: bob.id,
    };
    expect(await repository.count(filters)).toBe(2);
    const page1 = await repository.findMany(filters);
    const page2 = await repository.findMany({ ...filters, offset: 1 });
    expect(new Set([page1[0]?.id, page2[0]?.id])).toEqual(
      new Set([first.id, second.id]),
    );
    const selected = [...page1, ...page2].find(
      (article) => article.id === first.id,
    );
    expect(selected).toMatchObject({ favorited: true, favoritesCount: 2 });
    expect(selected?.tagList.sort()).toEqual(['favorite-tag', 'second-tag']);
    await repository.removeFavorite(first.id, alice.id);
    await repository.removeFavorite(first.id, alice.id);
    expect(await repository.findBySlug(first.slug, alice.id)).toMatchObject({
      favorited: false,
      favoritesCount: 1,
    });
  });
});
