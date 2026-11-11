import { resolveUniqueSlug } from './article-slug.service';

describe('resolveUniqueSlug', () => {
  it('reserves the feed route even if the slug is unused', async () => {
    await expect(
      resolveUniqueSlug('Feed', () => Promise.resolve(false)),
    ).resolves.toBe('feed-2');
  });

  it('avoids collisions with existing suffixed slugs', async () => {
    await expect(
      resolveUniqueSlug('Feed', (slug) => Promise.resolve(slug === 'feed-2')),
    ).resolves.toBe('feed-3');
  });
});
