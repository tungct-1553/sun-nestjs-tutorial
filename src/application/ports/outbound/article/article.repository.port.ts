import { Article } from '@domain/models/article';

export interface ArticleFilters {
  followedById?: string;
  tag?: string;
  authorUsername?: string;
  favorited?: string;
  viewerId?: string;
  limit: number;
  offset: number;
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  description: string;
  body: string;
  authorId: string;
  tagList: string[];
}

export interface UpdateArticleInput {
  slug?: string;
  title?: string;
  description?: string;
  body?: string;
  tagList?: string[];
}

export interface ArticleRepositoryPort {
  findBySlug(slug: string, viewerId?: string): Promise<Article | null>;
  findById(id: string, viewerId?: string): Promise<Article | null>;
  findMany(filters: ArticleFilters): Promise<Article[]>;
  count(filters: ArticleFilters): Promise<number>;
  create(input: CreateArticleInput): Promise<Article>;
  update(
    id: string,
    input: UpdateArticleInput,
    viewerId?: string,
  ): Promise<Article>;
  delete(id: string): Promise<void>;
  addFavorite(articleId: string, userId: string): Promise<void>;
  removeFavorite(articleId: string, userId: string): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
}
