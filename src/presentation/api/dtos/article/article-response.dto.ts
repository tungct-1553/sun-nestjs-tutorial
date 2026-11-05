import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArticleAuthorResult,
  ArticleResult,
  ArticlesListResult,
} from '@application/ports/inbound/article/article.types';

export class ArticleAuthorResponseDto {
  @ApiProperty({ example: 'jake' })
  username!: string;

  @ApiProperty({ nullable: true, example: 'I work at statefarm' })
  bio!: string | null;

  @ApiProperty({
    nullable: true,
    example: 'https://i.stack.imgur.com/xHWG8.jpg',
  })
  image!: string | null;

  @ApiProperty({ example: false })
  following!: boolean;

  constructor(author: ArticleAuthorResult) {
    this.username = author.username;
    this.bio = author.bio;
    this.image = author.image;
    this.following = author.following;
  }
}

export class ArticleBodyResponseDto {
  @ApiProperty({ example: 'how-to-train-your-dragon' })
  slug!: string;

  @ApiProperty({ example: 'How to train your dragon' })
  title!: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  description!: string;

  @ApiPropertyOptional({ example: 'You have to believe' })
  body?: string;

  @ApiProperty({ example: ['dragons', 'training'], type: [String] })
  tagList!: string[];

  @ApiProperty({ example: '2016-02-18T03:22:56.637Z' })
  createdAt!: string;

  @ApiProperty({ example: '2016-02-18T03:48:35.824Z' })
  updatedAt!: string;

  @ApiProperty({ example: false })
  favorited!: boolean;

  @ApiProperty({ example: 0 })
  favoritesCount!: number;

  @ApiProperty({ type: ArticleAuthorResponseDto })
  author!: ArticleAuthorResponseDto;

  constructor(article: ArticleResult) {
    this.slug = article.slug;
    this.title = article.title;
    this.description = article.description;
    if (article.body !== undefined) {
      this.body = article.body;
    }
    this.tagList = article.tagList;
    this.createdAt = article.createdAt;
    this.updatedAt = article.updatedAt;
    this.favorited = article.favorited;
    this.favoritesCount = article.favoritesCount;
    this.author = new ArticleAuthorResponseDto(article.author);
  }
}

export class ArticleResponseDto {
  @ApiProperty({ type: ArticleBodyResponseDto })
  article: ArticleBodyResponseDto;

  constructor(article: ArticleResult) {
    this.article = new ArticleBodyResponseDto(article);
  }
}

export class ArticlesListResponseDto {
  @ApiProperty({ type: [ArticleBodyResponseDto] })
  articles: ArticleBodyResponseDto[];

  @ApiProperty({ example: 2 })
  articlesCount: number;

  constructor(result: ArticlesListResult) {
    this.articles = result.articles.map(
      (article) => new ArticleBodyResponseDto(article),
    );
    this.articlesCount = result.articlesCount;
  }
}