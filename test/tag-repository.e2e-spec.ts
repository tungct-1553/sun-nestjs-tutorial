import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { TagEntity } from '@infrastructure/entities/tag.entity';
import { TagRepository } from '@infrastructure/repositories/tag.repository';

const url = process.env.TAG_TEST_DATABASE_URL;
const describeWithDatabase = url ? describe : describe.skip;

describeWithDatabase('TagRepository (PostgreSQL)', () => {
  const schema = `tags_test_${randomUUID().replaceAll('-', '')}`;
  let admin: DataSource;
  let dataSource: DataSource;

  beforeAll(async () => {
    admin = await new DataSource({ type: 'postgres', url }).initialize();
    await admin.query(`CREATE SCHEMA "${schema}"`);
    dataSource = await new DataSource({
      type: 'postgres',
      url,
      schema,
      entities: [TagEntity],
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

  it('reads names from PostgreSQL in alphabetical order and handles an empty table', async () => {
    const tags = dataSource.getRepository(TagEntity);
    const repository = new TagRepository(tags);
    await expect(repository.findAll()).resolves.toEqual([]);
    await tags.save([{ name: 'typescript' }, { name: 'nestjs' }]);
    await expect(repository.findAll()).resolves.toEqual([
      'nestjs',
      'typescript',
    ]);
  });
});
