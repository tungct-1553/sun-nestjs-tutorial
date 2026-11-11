import { randomUUID } from 'node:crypto';
import { FavoriteArticleUseCase } from '@application/use-cases/article/favorite-article.use-case';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { InternalException } from '@domain/exceptions/internal.exception';
import { DataSource } from 'typeorm';
import { ReserveArticleFeedSlug1783400000000 } from '@infrastructure/database/migrations/1783400000000-ReserveArticleFeedSlug';
import { CreateArticleFavoritesTable1783200000000 } from '@infrastructure/database/migrations/1783200000000-CreateArticleFavoritesTable';
import { CommentEntity } from '@infrastructure/entities/comment.entity';
import { CommentRepository } from '@infrastructure/repositories/comment.repository';
import { UserFollowEntity } from '@infrastructure/entities/user-follow.entity';
import { ArticleFavoriteEntity } from '@infrastructure/entities/article-favorite.entity';
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
      entities: [
        UserEntity,
        ArticleEntity,
        TagEntity,
        ArticleFavoriteEntity,
        UserFollowEntity,
        CommentEntity,
      ],
      synchronize: true,
    }).initialize();
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.query(`SET search_path TO "${schema}", public`);
    await runner.query('DROP TABLE "article_favorites"');
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
    const followRepository = dataSource.getRepository(UserFollowEntity);
    await followRepository.save({
      followerId: alice.id,
      followedId: author.id,
    });
    expect(
      (await repository.findBySlug(first.slug, alice.id))?.author.following,
    ).toBe(true);
    expect(
      (await repository.findBySlug(first.slug, bob.id))?.author.following,
    ).toBe(false);
    expect((await repository.findBySlug(first.slug))?.author.following).toBe(
      false,
    );
    expect(
      (
        await repository.findMany({
          tag: 'favorite-tag',
          limit: 10,
          offset: 0,
          viewerId: alice.id,
        })
      ).every((item) => item.author.following),
    ).toBe(true);
    const comments = new CommentRepository(
      dataSource.getRepository(CommentEntity),
    );
    await comments.create(first.id, author.id, 'test following');
    expect(
      (await comments.findByArticleId(first.id, alice.id))[0]?.author.following,
    ).toBe(true);
    expect(
      (await comments.findByArticleId(first.id, bob.id))[0]?.author.following,
    ).toBe(false);
    expect(
      (await comments.findByArticleId(first.id))[0]?.author.following,
    ).toBe(false);
    await followRepository.delete({
      followerId: alice.id,
      followedId: author.id,
    });
    expect(
      (await comments.findByArticleId(first.id, alice.id))[0]?.author.following,
    ).toBe(false);
    expect(
      (await repository.findBySlug(first.slug, alice.id))?.author.following,
    ).toBe(false);
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

  it('returns only followed authors in the feed with correct counts and viewer metadata', async () => {
    const users = dataSource.getRepository(UserEntity);
    const makeUser = (name: string) =>
      users.save(
        users.create({
          email: `${name}@feed.test`,
          username: name,
          password: 'unused',
        }),
      );
    const viewer = await makeUser('feed-viewer');
    const followed = await makeUser('feed-followed');
    const other = await makeUser('feed-other');
    const repository = new ArticleRepository(
      dataSource.getRepository(ArticleEntity),
      dataSource.getRepository(TagEntity),
    );
    const create = (slug: string, authorId: string, tagList: string[]) =>
      repository.create({
        slug,
        title: slug,
        description: 'Description',
        body: 'Body',
        authorId,
        tagList,
      });
    const older = await create('feed-older', followed.id, [
      'feed-one',
      'feed-two',
    ]);
    const newer = await create('feed-newer', followed.id, ['feed-three']);
    await create('feed-excluded', other.id, []);
    await create('feed-own', viewer.id, []);
    const entities = dataSource.getRepository(ArticleEntity);
    await entities.update(older.id, {
      createdAt: new Date('2020-01-01T00:00:00Z'),
    });
    await entities.update(newer.id, {
      createdAt: new Date('2021-01-01T00:00:00Z'),
    });
    await dataSource
      .getRepository(UserFollowEntity)
      .save({ followerId: viewer.id, followedId: followed.id });
    await repository.addFavorite(older.id, viewer.id);
    const filters = {
      followedById: viewer.id,
      viewerId: viewer.id,
      limit: 1,
      offset: 0,
    };
    expect(await repository.count(filters)).toBe(2);
    expect(await repository.findMany(filters)).toMatchObject([
      { slug: 'feed-newer', author: { following: true } },
    ]);
    const page2 = await repository.findMany({ ...filters, offset: 1 });
    expect(page2).toMatchObject([
      {
        slug: 'feed-older',
        favorited: true,
        favoritesCount: 1,
        author: { following: true },
      },
    ]);
    expect(page2[0].tagList.sort()).toEqual(['feed-one', 'feed-two']);
    expect(await repository.findMany({ ...filters, limit: 0 })).toEqual([]);
    expect(await repository.count({ ...filters, followedById: other.id })).toBe(
      0,
    );
    await dataSource
      .getRepository(UserFollowEntity)
      .delete({ followerId: viewer.id, followedId: followed.id });
    expect(await repository.count(filters)).toBe(0);
  });

  it('moves a legacy feed slug without colliding with an existing slug', async () => {
    const users = dataSource.getRepository(UserEntity);
    const author = await users.save(
      users.create({
        email: 'legacy-feed@example.test',
        username: 'legacy-feed',
        password: 'unused',
      }),
    );
    const repository = new ArticleRepository(
      dataSource.getRepository(ArticleEntity),
      dataSource.getRepository(TagEntity),
    );
    const create = (slug: string) =>
      repository.create({
        slug,
        title: slug,
        description: 'Description',
        body: 'Body',
        authorId: author.id,
        tagList: [],
      });
    const legacy = await create('feed');
    const collision = await create('feed-2');
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.query(`SET search_path TO "${schema}", public`);
    const migration = new ReserveArticleFeedSlug1783400000000();
    try {
      await runner.startTransaction();
      await migration.up(runner);
      await runner.commitTransaction();
      expect((await repository.findById(legacy.id))?.slug).toBe('feed-3');
      expect((await repository.findById(collision.id))?.slug).toBe('feed-2');
      await expect(
        dataSource
          .getRepository(ArticleEntity)
          .update(legacy.id, { slug: 'feed' }),
      ).rejects.toThrow();
      await migration.down(runner);
      expect((await repository.findById(legacy.id))?.slug).toBe('feed-3');
    } finally {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
    }
  });

  it('handles article deletion or slug change between lookup and favorite', async () => {
    const users = dataSource.getRepository(UserEntity);
    const author = await users.save(
      users.create({
        email: 'race-author@example.test',
        username: 'race-author',
        password: 'unused',
      }),
    );
    const viewer = await users.save(
      users.create({
        email: 'race-viewer@example.test',
        username: 'race-viewer',
        password: 'unused',
      }),
    );
    const repository = new ArticleRepository(
      dataSource.getRepository(ArticleEntity),
      dataSource.getRepository(TagEntity),
    );
    const useCase = new FavoriteArticleUseCase(repository);
    const article = await repository.create({
      slug: 'race-old-slug',
      title: 'Race',
      description: 'Description',
      body: 'Body',
      authorId: author.id,
      tagList: [],
    });

    const addFavorite = repository.addFavorite.bind(repository);
    const changeSlug = jest
      .spyOn(repository, 'addFavorite')
      .mockImplementationOnce(async (id, userId) => {
        await dataSource.getRepository(ArticleEntity).update(id, {
          slug: 'race-new-slug',
        });
        await addFavorite(id, userId);
      });
    await expect(
      useCase.execute(article.slug, viewer.id, true),
    ).resolves.toMatchObject({
      slug: 'race-new-slug',
      favorited: true,
      favoritesCount: 1,
    });
    changeSlug.mockRestore();

    jest
      .spyOn(repository, 'addFavorite')
      .mockImplementationOnce(async (id, userId) => {
        await repository.delete(id);
        await addFavorite(id, userId);
      });
    await expect(
      useCase.execute('race-new-slug', viewer.id, true),
    ).rejects.toBeInstanceOf(ArticleNotFoundException);
    jest.restoreAllMocks();

    const another = await repository.create({
      slug: 'race-another',
      title: 'Another',
      description: 'Description',
      body: 'Body',
      authorId: author.id,
      tagList: [],
    });
    await expect(
      repository.addFavorite(another.id, randomUUID()),
    ).rejects.toBeInstanceOf(InternalException);
  });
});
