import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { UserCredentialsDto } from '@presentation/api/dtos/auth/user-credentials.dto';

export class RegisterUserBodyDto extends UserCredentialsDto {
  @IsString()
  @IsNotEmpty({ message: 'validation.username' })
  username!: string;
}

export class RegisterUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RegisterUserBodyDto)
  user!: RegisterUserBodyDto;
}
