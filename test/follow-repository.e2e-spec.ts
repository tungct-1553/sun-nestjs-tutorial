import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { CreateUserFollowsTable1783300000000 } from '@infrastructure/database/migrations/1783300000000-CreateUserFollowsTable';
import { UserFollowEntity } from '@infrastructure/entities/user-follow.entity';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { UserEntity } from '@infrastructure/entities/user.entity';
import { FollowRepository } from '@infrastructure/repositories/follow.repository';

const url = process.env.PROFILE_TEST_DATABASE_URL;
const describeWithDatabase = url ? describe : describe.skip;

describeWithDatabase('FollowRepository (PostgreSQL)', () => {
  const schema = `follow_test_${randomUUID().replaceAll('-', '')}`;
  let admin: DataSource;
  let dataSource: DataSource;

  beforeAll(async () => {
    admin = await new DataSource({ type: 'postgres', url }).initialize();
    await admin.query(`CREATE SCHEMA "${schema}"`);
    dataSource = await new DataSource({
      type: 'postgres',
      url,
      schema,
      entities: [UserEntity, UserFollowEntity],
      synchronize: true,
    }).initialize();
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.query(`SET search_path TO "${schema}", public`);
    await runner.query('DROP TABLE "user_follows"');
    await new CreateUserFollowsTable1783300000000().up(runner);
    await runner.release();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    if (admin?.isInitialized) {
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
      await admin.destroy();
    }
  });

  it('persists a unique relationship and cascades deletion', async () => {
    const users = dataSource.getRepository(UserEntity);
    const a = await users.save(
      users.create({
        username: 'alice',
        email: 'alice@example.test',
        password: 'unused',
      }),
    );
    const b = await users.save(
      users.create({
        username: 'bob',
        email: 'bob@example.test',
        password: 'unused',
      }),
    );
    const follows = new FollowRepository(
      dataSource.getRepository(UserFollowEntity),
    );
    await Promise.all([follows.follow(a.id, b.id), follows.follow(a.id, b.id)]);
    expect(await follows.isFollowing(a.id, b.id)).toBe(true);
    expect(await follows.isFollowing(b.id, a.id)).toBe(false);
    expect(await dataSource.getRepository(UserFollowEntity).count()).toBe(1);
    await follows.unfollow(a.id, b.id);
    await follows.unfollow(a.id, b.id);
    expect(await follows.isFollowing(a.id, b.id)).toBe(false);
    await follows.follow(a.id, b.id);
    await users.delete(b.id);
    expect(await dataSource.getRepository(UserFollowEntity).count()).toBe(0);
    await expect(follows.follow(a.id, b.id)).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });
});
