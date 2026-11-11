import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagRepositoryPort } from '@application/ports/outbound/tag/tag.repository.port';
import { TagEntity } from '@infrastructure/entities/tag.entity';

@Injectable()
export class TagRepository implements TagRepositoryPort {
  constructor(
    @InjectRepository(TagEntity)
    private readonly repository: Repository<TagEntity>,
  ) {}

  async findAll(): Promise<string[]> {
    const tags = await this.repository.find({
      select: { name: true },
      order: { name: 'ASC' },
    });
    return tags.map((tag) => tag.name);
  }
}
