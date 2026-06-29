import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserCredentialsDto {
  @IsEmail({}, { message: 'validation.email' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'validation.password' })
  @MinLength(1)
  password!: string;
}
