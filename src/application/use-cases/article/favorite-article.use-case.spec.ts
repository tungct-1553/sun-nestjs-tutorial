import { FavoriteArticleUseCase } from '@application/use-cases/article/favorite-article.use-case';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { Article } from '@domain/models/article';

describe('FavoriteArticleUseCase', () => {
  const findBySlug = jest.fn();
  const findById = jest.fn();
  const addFavorite = jest.fn();
  const removeFavorite = jest.fn();
  const repository: jest.Mocked<ArticleRepositoryPort> = {
    findBySlug,
    findById,
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
      findById.mockResolvedValue(article);
      await useCase.execute('slug', 'user', favorite);
      expect(favorite ? addFavorite : removeFavorite).toHaveBeenCalledWith(
        'id',
        'user',
      );
      expect(findBySlug).toHaveBeenCalledWith('slug', 'user');
      expect(findById).toHaveBeenCalledWith('id', 'user');
    },
  );

  it('throws not found without changing favorites', async () => {
    findBySlug.mockResolvedValue(null);
    await expect(
      useCase.execute('missing', 'user', true),
    ).rejects.toBeInstanceOf(ArticleNotFoundException);
    expect(addFavorite).not.toHaveBeenCalled();
  });

  it('returns the updated article when its slug changes during favorite', async () => {
    findBySlug.mockResolvedValue(article);
    findById.mockResolvedValue(
      new Article({ ...article, slug: 'new-slug', favorited: true }),
    );
    const result = await useCase.execute('slug', 'user', true);
    expect(result).toMatchObject({ slug: 'new-slug', favorited: true });
    expect(findById).toHaveBeenCalledWith('id', 'user');
  });

  it('throws not found if the article is deleted after the mutation', async () => {
    findBySlug.mockResolvedValue(article);
    findById.mockResolvedValue(null);
    await expect(useCase.execute('slug', 'user', false)).rejects.toBeInstanceOf(
      ArticleNotFoundException,
    );
  });
});
