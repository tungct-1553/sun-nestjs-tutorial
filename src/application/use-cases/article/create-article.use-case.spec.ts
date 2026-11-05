import { CreateArticleUseCase } from '@application/use-cases/article/create-article.use-case';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { Article } from '@domain/models/article';

describe('CreateArticleUseCase', () => {
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

  const useCase = new CreateArticleUseCase(articleRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an article with a slug generated from title', async () => {
    articleRepository.slugExists.mockResolvedValue(false);
    articleRepository.create.mockResolvedValue(article);

    const result = await useCase.execute({
      authorId: 'user-1',
      title: 'How to train your dragon',
      description: 'Ever wonder how?',
      body: 'You have to believe',
      tagList: ['dragons'],
    });

    expect(articleRepository.create.mock.calls[0]?.[0]).toEqual({
      slug: 'how-to-train-your-dragon',
      title: 'How to train your dragon',
      description: 'Ever wonder how?',
      body: 'You have to believe',
      authorId: 'user-1',
      tagList: ['dragons'],
    });
    expect(result.slug).toBe('how-to-train-your-dragon');
    expect(result.body).toBe('You have to believe');
  });
});