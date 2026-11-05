import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'string' },
    },
    example: { error: ['Email or password is invalid'] },
  })
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    this.errors = errors;
  }
}
