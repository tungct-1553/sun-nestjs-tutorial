import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthenticatedUserResult } from '@application/ports/inbound/auth/auth.types';

export class UserBodyResponseDto {
  @ApiProperty({ example: 'jake@jake.jake' })
  email!: string;

  @ApiProperty({ example: 'jake' })
  username!: string;

  @ApiProperty({ nullable: true, example: 'I work at statefarm' })
  bio!: string | null;

  @ApiProperty({
    nullable: true,
    example: 'https://i.stack.imgur.com/xHWG8.jpg',
  })
  image!: string | null;

  @ApiPropertyOptional({
    example: 'jwt.token.here',
    description: 'Present on register and login responses only',
  })
  token?: string;
}

export class UserResponseDto {
  @ApiProperty({ type: UserBodyResponseDto })
  user: UserBodyResponseDto;

  constructor(user: AuthenticatedUserResult) {
    this.user = user;
  }
}
