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
  @IsEmail()
  email?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  username?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
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