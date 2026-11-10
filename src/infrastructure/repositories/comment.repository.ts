import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CommentRepositoryPort } from '@application/ports/outbound/comment/comment.repository.port';
import { Comment } from '@domain/models/comment';
import { UserFollowEntity } from '@infrastructure/entities/user-follow.entity';
import { CommentEntity } from '@infrastructure/entities/comment.entity';

function toDomainComment(entity: CommentEntity): Comment {
  return {
    id: entity.id,
    articleId: entity.articleId,
    authorId: entity.authorId,
    body: entity.body,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    author: {
      username: entity.author.username,
      bio: entity.author.bio,
      image: entity.author.image,
    },
  };
}

@Injectable()
export class CommentRepository implements CommentRepositoryPort {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
  ) {}
  async create(
    articleId: string,
    authorId: string,
    body: string,
  ): Promise<Comment> {
    const saved = await this.repository.save(
      this.repository.create({ articleId, authorId, body }),
    );
    return toDomainComment(
      await this.repository.findOneOrFail({ where: { id: saved.id } }),
    );
  }
  async findByArticleId(
    articleId: string,
    viewerId?: string,
  ): Promise<Comment[]> {
    const entities = await this.repository.find({
      where: { articleId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    const followed =
      viewerId && entities.length
        ? await this.repository.manager.getRepository(UserFollowEntity).find({
            where: {
              followerId: viewerId,
              followedId: In(entities.map((item) => item.authorId)),
            },
            select: { followedId: true },
          })
        : [];
    const followedIds = new Set(followed.map((follow) => follow.followedId));
    return entities.map((entity) => {
      const comment = toDomainComment(entity);
      return {
        ...comment,
        author: {
          ...comment.author,
          following: followedIds.has(comment.authorId),
        },
      };
    });
  }
  async findByIdAndArticleId(
    id: string,
    articleId: string,
  ): Promise<Comment | null> {
    const entity = await this.repository.findOne({ where: { id, articleId } });
    return entity ? toDomainComment(entity) : null;
  }
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
