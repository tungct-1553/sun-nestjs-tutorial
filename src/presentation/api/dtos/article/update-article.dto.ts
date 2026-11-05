import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class UpdateArticleBodyDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'validation.article.title' })
  title?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'validation.article.description' })
  description?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'validation.article.body' })
  body?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}

export class UpdateArticleDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateArticleBodyDto)
  article!: UpdateArticleBodyDto;
}