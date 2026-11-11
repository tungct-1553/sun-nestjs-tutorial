import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { FavoriteArticlePort } from '@application/ports/inbound/article/favorite-article.port';
import { OptionalCurrentUser } from '@presentation/api/decorators/optional-current-user.decorator';
import type { CreateArticlePort } from '@application/ports/inbound/article/create-article.port';
import type { DeleteArticlePort } from '@application/ports/inbound/article/delete-article.port';
import type { GetArticlePort } from '@application/ports/inbound/article/get-article.port';
import type { ListArticlesPort } from '@application/ports/inbound/article/list-articles.port';
import type { UpdateArticlePort } from '@application/ports/inbound/article/update-article.port';
import {
  CREATE_ARTICLE_PORT,
  FAVORITE_ARTICLE_PORT,
  DELETE_ARTICLE_PORT,
  GET_ARTICLE_PORT,
  LIST_ARTICLES_PORT,
  UPDATE_ARTICLE_PORT,
} from '@application/ports/tokens';
import type { AuthenticatedRequestUser } from '@presentation/api/decorators/current-user.decorator';
import { CurrentUser } from '@presentation/api/decorators/current-user.decorator';
import { CreateArticleDto } from '@presentation/api/dtos/article/create-article.dto';
import {
  ArticleResponseDto,
  ArticlesListResponseDto,
} from '@presentation/api/dtos/article/article-response.dto';
import { ListArticlesQueryDto } from '@presentation/api/dtos/article/list-articles-query.dto';
import { FeedArticlesQueryDto } from '@presentation/api/dtos/article/feed-articles-query.dto';
import { UpdateArticleDto } from '@presentation/api/dtos/article/update-article.dto';
import { ErrorResponseDto } from '@presentation/api/dtos/common/error-response.dto';
import { JwtAuthGuard } from '@presentation/api/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@presentation/api/guards/optional-jwt-auth.guard';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    @Inject(FAVORITE_ARTICLE_PORT)
    private readonly favoriteArticlePort: FavoriteArticlePort,
    @Inject(LIST_ARTICLES_PORT)
    private readonly listArticlesPort: ListArticlesPort,
    @Inject(GET_ARTICLE_PORT)
    private readonly getArticlePort: GetArticlePort,
    @Inject(CREATE_ARTICLE_PORT)
    private readonly createArticlePort: CreateArticlePort,
    @Inject(UPDATE_ARTICLE_PORT)
    private readonly updateArticlePort: UpdateArticlePort,
    @Inject(DELETE_ARTICLE_PORT)
    private readonly deleteArticlePort: DeleteArticlePort,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List articles' })
  @ApiOkResponse({ type: ArticlesListResponseDto })
  async listArticles(
    @Query() query: ListArticlesQueryDto,
    @OptionalCurrentUser() currentUser: AuthenticatedRequestUser | null,
  ): Promise<ArticlesListResponseDto> {
    const result = await this.listArticlesPort.execute({
      ...query,
      ...(currentUser ? { viewerId: currentUser.userId } : {}),
    });
    return new ArticlesListResponseDto(result);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get articles from followed users' })
  @ApiOkResponse({ type: ArticlesListResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  async getFeed(
    @Query() query: FeedArticlesQueryDto,
    @CurrentUser() currentUser: AuthenticatedRequestUser,
  ): Promise<ArticlesListResponseDto> {
    const result = await this.listArticlesPort.execute({
      ...query,
      followedById: currentUser.userId,
      viewerId: currentUser.userId,
    });
    return new ArticlesListResponseDto(result);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async getArticle(
    @Param('slug') slug: string,
    @OptionalCurrentUser() currentUser: AuthenticatedRequestUser | null,
  ): Promise<ArticleResponseDto> {
    const result = await this.getArticlePort.execute(slug, currentUser?.userId);
    return new ArticleResponseDto(result);
  }

  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Favorite article' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async favoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: AuthenticatedRequestUser,
  ): Promise<ArticleResponseDto> {
    return new ArticleResponseDto(
      await this.favoriteArticlePort.execute(slug, currentUser.userId, true),
    );
  }

  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Unfavorite article' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: AuthenticatedRequestUser,
  ): Promise<ArticleResponseDto> {
    return new ArticleResponseDto(
      await this.favoriteArticlePort.execute(slug, currentUser.userId, false),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Create article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiCreatedResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  async createArticle(
    @CurrentUser() currentUser: AuthenticatedRequestUser,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    const result = await this.createArticlePort.execute({
      authorId: currentUser.userId,
      title: dto.article.title,
      description: dto.article.description,
      body: dto.article.body,
      tagList: dto.article.tagList,
    });
    return new ArticleResponseDto(result);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Update article' })
  @ApiBody({ type: UpdateArticleDto })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({
    type: ErrorResponseDto,
    description: 'Only the author can update the article',
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async updateArticle(
    @CurrentUser() currentUser: AuthenticatedRequestUser,
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const result = await this.updateArticlePort.execute({
      slug,
      authorId: currentUser.userId,
      title: dto.article.title,
      description: dto.article.description,
      body: dto.article.body,
      tagList: dto.article.tagList,
    });
    return new ArticleResponseDto(result);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Delete article' })
  @ApiOkResponse({ description: 'Article deleted successfully' })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({
    type: ErrorResponseDto,
    description: 'Only the author can delete the article',
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async deleteArticle(
    @CurrentUser() currentUser: AuthenticatedRequestUser,
    @Param('slug') slug: string,
  ): Promise<void> {
    await this.deleteArticlePort.execute({
      slug,
      authorId: currentUser.userId,
    });
  }
}
