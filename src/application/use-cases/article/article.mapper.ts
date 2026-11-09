import { ArticleResult } from '@application/ports/inbound/article/article.types';
import { Article } from '@domain/models/article';

export const toArticleResult = (
  article: Article,
  options?: { includeBody?: boolean },
): ArticleResult => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  ...(options?.includeBody !== false ? { body: article.body } : {}),
  tagList: article.tagList,
  createdAt: article.createdAt.toISOString(),
  updatedAt: article.updatedAt.toISOString(),
  favorited: article.favorited,
  favoritesCount: article.favoritesCount,
  author: {
    username: article.author.username,
    bio: article.author.bio,
    image: article.author.image,
    following: article.author.following ?? false,
  },
});
