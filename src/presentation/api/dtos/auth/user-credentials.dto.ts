import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { PreserveInputType } from '@presentation/api/decorators/preserve-input-type.decorator';

export class UserCredentialsDto {
  @PreserveInputType()
  @IsEmail({}, { message: 'validation.email' })
  email!: string;

  @PreserveInputType()
  @IsString()
  @IsNotEmpty({ message: 'validation.password' })
  password!: string;
}
