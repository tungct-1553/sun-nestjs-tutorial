import { ApiProperty } from '@nestjs/swagger';

export class TagsResponseDto {
  @ApiProperty({ type: [String], example: ['nestjs', 'typescript'] })
  tags: string[];

  constructor(tags: string[]) {
    this.tags = tags;
  }
}
