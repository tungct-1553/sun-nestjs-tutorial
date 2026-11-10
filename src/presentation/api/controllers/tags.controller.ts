import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ListTagsPort } from '@application/ports/inbound/tag/list-tags.port';
import { LIST_TAGS_PORT } from '@application/ports/tokens';
import { TagsResponseDto } from '@presentation/api/dtos/tag/tags-response.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(
    @Inject(LIST_TAGS_PORT) private readonly listTags: ListTagsPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List tags' })
  @ApiOkResponse({ type: TagsResponseDto })
  async getTags(): Promise<TagsResponseDto> {
    return new TagsResponseDto(await this.listTags.execute());
  }
}
