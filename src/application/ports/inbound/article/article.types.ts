export interface ArticleAuthorResult {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface ArticleResult {
  slug: string;
  title: string;
  description: string;
  body?: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: ArticleAuthorResult;
}

export interface ArticlesListResult {
  articles: ArticleResult[];
  articlesCount: number;
}

export interface CreateArticleCommand {
  authorId: string;
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface UpdateArticleCommand {
  slug: string;
  authorId: string;
  title?: string;
  description?: string;
  body?: string;
  tagList?: string[];
}

export interface DeleteArticleCommand {
  slug: string;
  authorId: string;
}

export interface ListArticlesQuery {
  tag?: string;
  author?: string;
  limit?: number;
  offset?: number;
}