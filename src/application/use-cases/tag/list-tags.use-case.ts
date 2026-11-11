import { ListTagsPort } from '@application/ports/inbound/tag/list-tags.port';
import { TagRepositoryPort } from '@application/ports/outbound/tag/tag.repository.port';

export class ListTagsUseCase implements ListTagsPort {
  constructor(private readonly tags: TagRepositoryPort) {}

  execute(): Promise<string[]> {
    return this.tags.findAll();
  }
}
