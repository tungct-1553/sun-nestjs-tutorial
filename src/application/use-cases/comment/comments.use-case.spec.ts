import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { CommentRepositoryPort } from '@application/ports/outbound/comment/comment.repository.port';
import { CreateCommentUseCase } from './create-comment.use-case';
import { ListCommentsUseCase } from './list-comments.use-case';
import { DeleteCommentUseCase } from './delete-comment.use-case';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { CommentNotFoundException } from '@domain/exceptions/comment-not-found.exception';
import { CommentForbiddenException } from '@domain/exceptions/comment-forbidden.exception';
import { Article } from '@domain/models/article';
import { Comment } from '@domain/models/comment';

describe('comment use cases', () => {
  const articles: jest.Mocked<ArticleRepositoryPort> = {
    findBySlug: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    slugExists: jest.fn(),
  };
  const comments: jest.Mocked<CommentRepositoryPort> = {
    create: jest.fn(),
    findByArticleId: jest.fn(),
    findByIdAndArticleId: jest.fn(),
    delete: jest.fn(),
  };
  const article = { id: 'article-1' } as Article;
  const comment: Comment = {
    id: 'comment-1',
    articleId: article.id,
    authorId: 'author-1',
    body: 'Great!',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    author: { username: 'jake', bio: null, image: null },
  };
  beforeEach(() => {
    jest.resetAllMocks();
    articles.findBySlug.mockResolvedValue(article);
  });
  it('creates a comment for the selected article and returns its author', async () => {
    comments.create.mockResolvedValue(comment);
    const result = await new CreateCommentUseCase(articles, comments).execute(
      'slug',
      'author-1',
      'Great!',
    );
    expect(comments.create.mock.calls).toEqual([
      ['article-1', 'author-1', 'Great!'],
    ]);
    expect(result).toEqual({
      id: 'comment-1',
      body: 'Great!',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      author: { username: 'jake', bio: null, image: null, following: false },
    });
  });
  it('does not expose sensitive author fields', async () => {
    const authorWithSecrets = {
      ...comment.author,
      email: 'private@example.com',
      password: 'hashed-secret',
      id: 'private-id',
    };
    comments.create.mockResolvedValue({
      ...comment,
      author: authorWithSecrets,
    });
    comments.findByArticleId.mockResolvedValue([
      { ...comment, author: authorWithSecrets },
    ]);
    const created = await new CreateCommentUseCase(articles, comments).execute(
      'slug',
      'author-1',
      'Great!',
    );
    const listed = await new ListCommentsUseCase(articles, comments).execute(
      'slug',
    );
    const expected = {
      username: 'jake',
      bio: null,
      image: null,
      following: false,
    };
    expect(created.author).toEqual(expected);
    expect(listed[0].author).toEqual(expected);
  });
  it('lists comments only for the selected article', async () => {
    comments.findByArticleId.mockResolvedValue([comment]);
    const result = await new ListCommentsUseCase(articles, comments).execute(
      'slug',
    );
    expect(comments.findByArticleId.mock.calls).toEqual([['article-1']]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('comment-1');
  });
  it('returns viewer-specific follow state without exposing extra fields', async () => {
    comments.findByArticleId.mockResolvedValue([
      { ...comment, author: { ...comment.author, following: true } },
    ]);
    const result = await new ListCommentsUseCase(articles, comments).execute(
      'slug',
      'viewer-1',
    );
    expect(comments.findByArticleId.mock.calls).toContainEqual([
      'article-1',
      'viewer-1',
    ]);
    expect(result[0].author.following).toBe(true);
  });
  it('rejects create, list and delete when article does not exist', async () => {
    articles.findBySlug.mockResolvedValue(null);
    await expect(
      new CreateCommentUseCase(articles, comments).execute(
        'missing',
        'author-1',
        'hello',
      ),
    ).rejects.toBeInstanceOf(ArticleNotFoundException);
    await expect(
      new ListCommentsUseCase(articles, comments).execute('missing'),
    ).rejects.toBeInstanceOf(ArticleNotFoundException);
    await expect(
      new DeleteCommentUseCase(articles, comments).execute(
        'missing',
        'comment-1',
        'author-1',
      ),
    ).rejects.toBeInstanceOf(ArticleNotFoundException);
    expect(comments.create.mock.calls).toHaveLength(0);
    expect(comments.delete.mock.calls).toHaveLength(0);
  });
  it('deletes a comment owned by the requester', async () => {
    comments.findByIdAndArticleId.mockResolvedValue(comment);
    await new DeleteCommentUseCase(articles, comments).execute(
      'slug',
      'comment-1',
      'author-1',
    );
    expect(comments.findByIdAndArticleId.mock.calls).toEqual([
      ['comment-1', 'article-1'],
    ]);
    expect(comments.delete.mock.calls).toEqual([['comment-1']]);
  });
  it('rejects deletion by another user', async () => {
    comments.findByIdAndArticleId.mockResolvedValue(comment);
    await expect(
      new DeleteCommentUseCase(articles, comments).execute(
        'slug',
        'comment-1',
        'other',
      ),
    ).rejects.toBeInstanceOf(CommentForbiddenException);
    expect(comments.delete.mock.calls).toHaveLength(0);
  });
  it('rejects deletion when the comment belongs to another article or is missing', async () => {
    comments.findByIdAndArticleId.mockResolvedValue(null);
    await expect(
      new DeleteCommentUseCase(articles, comments).execute(
        'slug',
        'comment-1',
        'author-1',
      ),
    ).rejects.toBeInstanceOf(CommentNotFoundException);
    expect(comments.delete.mock.calls).toHaveLength(0);
  });
});
