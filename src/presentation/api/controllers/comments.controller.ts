import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  CREATE_COMMENT_PORT,
  LIST_COMMENTS_PORT,
  DELETE_COMMENT_PORT,
} from '@application/ports/tokens';
import type { CreateCommentPort } from '@application/ports/inbound/comment/create-comment.port';
import type { ListCommentsPort } from '@application/ports/inbound/comment/list-comment.port';
import type { DeleteCommentPort } from '@application/ports/inbound/comment/delete-comment.port';
import { OptionalCurrentUser } from '@presentation/api/decorators/optional-current-user.decorator';
import { OptionalJwtAuthGuard } from '@presentation/api/guards/optional-jwt-auth.guard';
import { CurrentUser } from '@presentation/api/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '@presentation/api/decorators/current-user.decorator';
import { JwtAuthGuard } from '@presentation/api/guards/jwt-auth.guard';
import { CreateCommentDto } from '@presentation/api/dtos/comment/create-comment.dto';
import {
  CommentResponseDto,
  CommentsResponseDto,
} from '@presentation/api/dtos/comment/comment-response.dto';

@ApiTags('Comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(
    @Inject(CREATE_COMMENT_PORT)
    private readonly createComment: CreateCommentPort,
    @Inject(LIST_COMMENTS_PORT)
    private readonly listComments: ListCommentsPort,
    @Inject(DELETE_COMMENT_PORT)
    private readonly deleteComment: DeleteCommentPort,
  ) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Add a comment to an article' })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @ApiNotFoundResponse()
  async create(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return new CommentResponseDto(
      await this.createComment.execute(slug, user.userId, dto.comment.body),
    );
  }
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List comments for an article' })
  @ApiOkResponse({ type: CommentsResponseDto })
  @ApiNotFoundResponse()
  async list(
    @Param('slug') slug: string,
    @OptionalCurrentUser() user: AuthenticatedRequestUser | null,
  ): Promise<CommentsResponseDto> {
    return new CommentsResponseDto(
      await this.listComments.execute(slug, user?.userId),
    );
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Delete your comment' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  async delete(
    @Param('slug') slug: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<void> {
    await this.deleteComment.execute(slug, id, user.userId);
  }
}
