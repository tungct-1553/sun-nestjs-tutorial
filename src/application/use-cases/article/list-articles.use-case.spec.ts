import { ListArticlesUseCase } from '@application/use-cases/article/list-articles.use-case';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { Article } from '@domain/models/article';

describe('ListArticlesUseCase', () => {
  const article = new Article({
    id: 'article-1',
    slug: 'how-to-train-your-dragon',
    title: 'How to train your dragon',
    description: 'Ever wonder how?',
    body: 'You have to believe',
    authorId: 'user-1',
    author: {
      username: 'jake',
      bio: null,
      image: null,
    },
    tagList: ['dragons'],
    createdAt: new Date('2016-02-18T03:22:56.637Z'),
    updatedAt: new Date('2016-02-18T03:22:56.637Z'),
  });

  const articleRepository: jest.Mocked<ArticleRepositoryPort> = {
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    slugExists: jest.fn(),
  };

  const useCase = new ListArticlesUseCase(articleRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns articles without body and total count', async () => {
    articleRepository.findMany.mockResolvedValue([article]);
    articleRepository.count.mockResolvedValue(1);

    const result = await useCase.execute({ author: 'jake' });

    expect(articleRepository.findMany.mock.calls[0]?.[0]).toEqual({
      tag: undefined,
      authorUsername: 'jake',
      limit: 20,
      offset: 0,
    });
    expect(result.articlesCount).toBe(1);
    expect(result.articles[0]?.body).toBeUndefined();
    expect(result.articles[0]?.slug).toBe('how-to-train-your-dragon');
  });
});