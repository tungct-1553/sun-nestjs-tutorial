import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
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
});
