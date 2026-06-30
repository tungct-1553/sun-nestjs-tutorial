import { DeleteArticleUseCase } from '@application/use-cases/article/delete-article.use-case';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { ArticleForbiddenException } from '@domain/exceptions/article-forbidden.exception';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { Article } from '@domain/models/article';

describe('DeleteArticleUseCase', () => {
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
    tagList: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const useCase = new DeleteArticleUseCase(articleRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes article when requester is the author', async () => {
    articleRepository.findBySlug.mockResolvedValue(article);
    articleRepository.delete.mockResolvedValue();

    await useCase.execute({
      slug: 'how-to-train-your-dragon',
      authorId: 'user-1',
    });

    expect(articleRepository.delete.mock.calls).toEqual([['article-1']]);
  });

  it('throws when article does not exist', async () => {
    articleRepository.findBySlug.mockResolvedValue(null);

    await expect(
      useCase.execute({
        slug: 'missing',
        authorId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ArticleNotFoundException);
  });

  it('throws when requester is not the author', async () => {
    articleRepository.findBySlug.mockResolvedValue(article);

    await expect(
      useCase.execute({
        slug: 'how-to-train-your-dragon',
        authorId: 'other-user',
      }),
    ).rejects.toBeInstanceOf(ArticleForbiddenException);
  });
});