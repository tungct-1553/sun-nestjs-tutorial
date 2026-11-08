import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ArticleFilters,
  ArticleRepositoryPort,
  CreateArticleInput,
  UpdateArticleInput,
} from '@application/ports/outbound/article/article.repository.port';
import { Article } from '@domain/models/article';
import { mapArticlePersistenceError } from '@infrastructure/database/errors/database-error.mapper';
import { ArticleEntity } from '@infrastructure/entities/article.entity';
import { TagEntity } from '@infrastructure/entities/tag.entity';
import { toDomainArticle } from '@infrastructure/mappers/article.mapper';

@Injectable()
export class ArticleRepository implements ArticleRepositoryPort {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async findBySlug(slug: string, viewerId?: string): Promise<Article | null> {
    const entity = await this.articleRepository.findOne({ where: { slug } });
    if (!entity) return null;
    const [article] = await this.populateFavorites(
      [toDomainArticle(entity)],
      viewerId,
    );
    return article;
  }

  async findMany(filters: ArticleFilters): Promise<Article[]> {
    const queryBuilder = this.buildFilteredQuery(filters);
    const entities = await queryBuilder
      .orderBy('article.created_at', 'DESC')
      .skip(filters.offset)
      .take(filters.limit)
      .getMany();

    return this.populateFavorites(
      entities.map(toDomainArticle),
      filters.viewerId,
    );
  }

  async count(filters: ArticleFilters): Promise<number> {
    const queryBuilder = this.buildFilteredQuery(filters);
    return queryBuilder.getCount();
  }

  async create(input: CreateArticleInput): Promise<Article> {
    try {
      const tags = await this.resolveTags(input.tagList);
      const entity = this.articleRepository.create({
        slug: input.slug,
        title: input.title,
        description: input.description,
        body: input.body,
        authorId: input.authorId,
        tags,
      });
      const saved = await this.articleRepository.save(entity);
      const reloaded = await this.articleRepository.findOneOrFail({
        where: { id: saved.id },
      });
      return toDomainArticle(reloaded);
    } catch (error) {
      return mapArticlePersistenceError(error);
    }
  }

  async update(
    id: string,
    input: UpdateArticleInput,
    viewerId?: string,
  ): Promise<Article> {
    try {
      const entity = await this.articleRepository.findOneOrFail({
        where: { id },
      });

      if (input.slug !== undefined) {
        entity.slug = input.slug;
      }
      if (input.title !== undefined) {
        entity.title = input.title;
      }
      if (input.description !== undefined) {
        entity.description = input.description;
      }
      if (input.body !== undefined) {
        entity.body = input.body;
      }
      if (input.tagList !== undefined) {
        entity.tags = await this.resolveTags(input.tagList);
      }

      await this.articleRepository.save(entity);
      const reloaded = await this.articleRepository.findOneOrFail({
        where: { id },
      });
      const [article] = await this.populateFavorites(
        [toDomainArticle(reloaded)],
        viewerId,
      );
      return article;
    } catch (error) {
      return mapArticlePersistenceError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.articleRepository.delete(id);
    } catch (error) {
      return mapArticlePersistenceError(error);
    }
  }

  async addFavorite(articleId: string, userId: string): Promise<void> {
    await this.articleRepository.query(
      `INSERT INTO ${this.tableName('article_favorites')} (article_id, user_id) VALUES ($1, $2) ON CONFLICT (article_id, user_id) DO NOTHING`,
      [articleId, userId],
    );
  }

  async removeFavorite(articleId: string, userId: string): Promise<void> {
    await this.articleRepository.query(
      `DELETE FROM ${this.tableName('article_favorites')} WHERE article_id = $1 AND user_id = $2`,
      [articleId, userId],
    );
  }

  private tableName(name: string): string {
    const schema = this.articleRepository.metadata.schema;
    const escape = (value: string) =>
      this.articleRepository.manager.connection.driver.escape(value);
    return schema ? `${escape(schema)}.${escape(name)}` : escape(name);
  }

  private async populateFavorites(
    articles: Article[],
    viewerId?: string,
  ): Promise<Article[]> {
    if (articles.length === 0) return [];
    const rows: { article_id: string; count: string; favorited: boolean }[] =
      await this.articleRepository.query(
        `SELECT article_id, COUNT(*)::text AS count, COALESCE(BOOL_OR(user_id = $2::uuid), false) AS favorited
       FROM ${this.tableName('article_favorites')} WHERE article_id = ANY($1::uuid[]) GROUP BY article_id`,
        [articles.map((article) => article.id), viewerId ?? null],
      );
    const byArticle = new Map(rows.map((row) => [row.article_id, row]));
    return articles.map((article) => {
      const stats = byArticle.get(article.id);
      return new Article({
        ...article,
        favoritesCount: Number(stats?.count ?? 0),
        favorited: stats?.favorited ?? false,
      });
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .where('article.slug = :slug', { slug });

    if (excludeId) {
      queryBuilder.andWhere('article.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  private buildFilteredQuery(filters: ArticleFilters) {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags');

    if (filters.tag) {
      queryBuilder.innerJoin(
        'article.tags',
        'filterTag',
        'filterTag.name = :tag',
        {
          tag: filters.tag,
        },
      );
    }

    if (filters.authorUsername) {
      queryBuilder.andWhere('author.username = :authorUsername', {
        authorUsername: filters.authorUsername,
      });
    }

    if (filters.favorited) {
      queryBuilder.andWhere(
        `EXISTS (
        SELECT 1 FROM ${this.tableName('article_favorites')} favorite
        JOIN ${this.tableName('users')} favorite_user ON favorite_user.id = favorite.user_id
        WHERE favorite.article_id = article.id AND favorite_user.username = :favorited
      )`,
        { favorited: filters.favorited },
      );
    }
    return queryBuilder;
  }

  private async resolveTags(tagList: string[]): Promise<TagEntity[]> {
    const normalizedTags = [
      ...new Set(tagList.map((tag) => tag.trim()).filter(Boolean)),
    ];

    if (normalizedTags.length === 0) {
      return [];
    }

    const tags: TagEntity[] = [];

    for (const name of normalizedTags) {
      let tag = await this.tagRepository.findOne({ where: { name } });
      if (!tag) {
        tag = await this.tagRepository.save(
          this.tagRepository.create({ name }),
        );
      }
      tags.push(tag);
    }

    return tags;
  }
}
