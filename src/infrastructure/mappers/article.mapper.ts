import { Article } from '@domain/models/article';
import { ArticleEntity } from '@infrastructure/entities/article.entity';

export const toDomainArticle = (entity: ArticleEntity): Article =>
  new Article({
    id: entity.id,
    slug: entity.slug,
    title: entity.title,
    description: entity.description,
    body: entity.body,
    authorId: entity.authorId,
    author: {
      username: entity.author.username,
      bio: entity.author.bio,
      image: entity.author.image,
    },
    tagList: entity.tags.map((tag) => tag.name),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });