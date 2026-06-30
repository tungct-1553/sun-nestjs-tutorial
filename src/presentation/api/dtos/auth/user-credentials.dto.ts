import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserCredentialsDto {
  @IsEmail({}, { message: 'validation.email' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'validation.password' })
  password!: string;
}
