import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserCredentialsDto } from '@presentation/api/dtos/auth/user-credentials.dto';

export class LoginUserDto {
  @ValidateNested()
  @Type(() => UserCredentialsDto)
  user!: UserCredentialsDto;
}
