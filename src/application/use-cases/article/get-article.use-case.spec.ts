import { GetArticleUseCase } from '@application/use-cases/article/get-article.use-case';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { Article } from '@domain/models/article';

describe('GetArticleUseCase', () => {
  const repository: jest.Mocked<ArticleRepositoryPort> = {
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    slugExists: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };
  const useCase = new GetArticleUseCase(repository);

  beforeEach(() => jest.resetAllMocks());

  it('returns the article including its body', async () => {
    repository.findBySlug.mockResolvedValue(
      new Article({
        id: 'article-1',
        slug: 'example',
        title: 'Example',
        description: 'Description',
        body: 'Body',
        authorId: 'user-1',
        author: { username: 'jake', bio: null, image: null },
        tagList: ['one'],
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      }),
    );
    await expect(useCase.execute('example')).resolves.toMatchObject({
      slug: 'example',
      body: 'Body',
      tagList: ['one'],
    });
    expect(repository.findBySlug.mock.calls).toEqual([['example']]);
  });

  it('rejects a missing article', async () => {
    repository.findBySlug.mockResolvedValue(null);
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      ArticleNotFoundException,
    );
  });
});
