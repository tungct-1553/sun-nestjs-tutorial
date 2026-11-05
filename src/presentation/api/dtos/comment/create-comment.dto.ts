import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentBodyDto {
  @ApiProperty({ example: 'Great article!' })
  @Transform(({ obj }: { obj: { body?: unknown } }) => obj.body)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  body!: string;
}
export class CreateCommentDto {
  @ApiProperty({ type: CreateCommentBodyDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateCommentBodyDto)
  comment!: CreateCommentBodyDto;
}
