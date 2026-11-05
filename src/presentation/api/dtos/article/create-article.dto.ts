import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateArticleBodyDto {
  @IsString()
  @IsNotEmpty({ message: 'validation.article.title' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'validation.article.description' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'validation.article.body' })
  body!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}

export class CreateArticleDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateArticleBodyDto)
  article!: CreateArticleBodyDto;
}