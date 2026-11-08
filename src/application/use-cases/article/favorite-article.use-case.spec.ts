import { FavoriteArticleUseCase } from '@application/use-cases/article/favorite-article.use-case';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { Article } from '@domain/models/article';

describe('FavoriteArticleUseCase', () => {
  const findBySlug = jest.fn();
  const addFavorite = jest.fn();
  const removeFavorite = jest.fn();
  const repository: jest.Mocked<ArticleRepositoryPort> = {
    findBySlug,
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    slugExists: jest.fn(),
    addFavorite,
    removeFavorite,
  };
  const article = new Article({
    id: 'id',
    slug: 'slug',
    title: 'title',
    description: 'description',
    body: 'body',
    authorId: 'author',
    author: { username: 'author', bio: null, image: null },
    tagList: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const useCase = new FavoriteArticleUseCase(repository);
  beforeEach(() => jest.resetAllMocks());

  it.each([true, false])(
    'updates favorite state when requested: %s',
    async (favorite) => {
      findBySlug.mockResolvedValue(article);
      await useCase.execute('slug', 'user', favorite);
      expect(favorite ? addFavorite : removeFavorite).toHaveBeenCalledWith(
        'id',
        'user',
      );
      expect(findBySlug).toHaveBeenCalledWith('slug', 'user');
    },
  );

  it('throws not found without changing favorites', async () => {
    findBySlug.mockResolvedValue(null);
    await expect(
      useCase.execute('missing', 'user', true),
    ).rejects.toBeInstanceOf(ArticleNotFoundException);
    expect(addFavorite).not.toHaveBeenCalled();
  });
});
