import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserCredentialsDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password!: string;
}
