import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { UserCredentialsDto } from '@presentation/api/dtos/auth/user-credentials.dto';

export class LoginUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserCredentialsDto)
  user!: UserCredentialsDto;
}
