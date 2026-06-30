import { Article } from '@domain/models/article';

export interface ArticleFilters {
  tag?: string;
  authorUsername?: string;
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
  findBySlug(slug: string): Promise<Article | null>;
  findMany(filters: ArticleFilters): Promise<Article[]>;
  count(filters: ArticleFilters): Promise<number>;
  create(input: CreateArticleInput): Promise<Article>;
  update(id: string, input: UpdateArticleInput): Promise<Article>;
  delete(id: string): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
}