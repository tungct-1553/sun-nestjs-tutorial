import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { UserCredentialsDto } from '@presentation/api/dtos/auth/user-credentials.dto';

export class LoginUserDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserCredentialsDto)
  user!: UserCredentialsDto;
}
