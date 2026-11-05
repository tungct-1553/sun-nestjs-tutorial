import { ApiProperty } from '@nestjs/swagger';
import { CommentResult } from '@application/ports/inbound/comment/comment.types';
import { ArticleAuthorResponseDto } from '@presentation/api/dtos/article/article-response.dto';

export class CommentBodyResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() body!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
  @ApiProperty({ type: ArticleAuthorResponseDto })
  author!: ArticleAuthorResponseDto;
  constructor(comment: CommentResult) {
    Object.assign(this, comment);
  }
}
export class CommentResponseDto {
  @ApiProperty({ type: CommentBodyResponseDto })
  comment: CommentBodyResponseDto;
  constructor(comment: CommentResult) {
    this.comment = new CommentBodyResponseDto(comment);
  }
}
export class CommentsResponseDto {
  @ApiProperty({ type: [CommentBodyResponseDto] })
  comments: CommentBodyResponseDto[];
  constructor(comments: CommentResult[]) {
    this.comments = comments.map(
      (comment) => new CommentBodyResponseDto(comment),
    );
  }
}
