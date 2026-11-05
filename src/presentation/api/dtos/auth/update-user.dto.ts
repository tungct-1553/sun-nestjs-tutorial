import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class UpdateUserBodyDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsEmail({}, { message: 'validation.email' })
  email?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1, { message: 'validation.username' })
  username?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1, { message: 'validation.password' })
  password?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  bio?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  image?: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateUserBodyDto)
  user!: UpdateUserBodyDto;
}