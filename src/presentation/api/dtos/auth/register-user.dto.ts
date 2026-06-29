import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UserCredentialsDto } from '@presentation/api/dtos/auth/user-credentials.dto';

export class RegisterUserBodyDto extends UserCredentialsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  username!: string;
}

export class RegisterUserDto {
  @ValidateNested()
  @Type(() => RegisterUserBodyDto)
  user!: RegisterUserBodyDto;
}
