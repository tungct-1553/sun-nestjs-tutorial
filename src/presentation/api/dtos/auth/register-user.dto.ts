import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PreserveInputType } from '@presentation/api/decorators/preserve-input-type.decorator';
import { UserCredentialsDto } from '@presentation/api/dtos/auth/user-credentials.dto';

export class RegisterUserBodyDto extends UserCredentialsDto {
  @PreserveInputType()
  @IsString()
  @IsNotEmpty({ message: 'validation.username' })
  username!: string;
}

export class RegisterUserDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RegisterUserBodyDto)
  user!: RegisterUserBodyDto;
}
