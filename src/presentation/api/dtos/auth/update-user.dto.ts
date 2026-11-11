import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PreserveInputType } from '@presentation/api/decorators/preserve-input-type.decorator';

export class UpdateUserBodyDto {
  @PreserveInputType()
  @ValidateIf((_, value) => value !== undefined)
  @IsEmail({}, { message: 'validation.email' })
  email?: string;

  @PreserveInputType()
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1, { message: 'validation.username' })
  username?: string;

  @PreserveInputType()
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1, { message: 'validation.password' })
  password?: string;

  @PreserveInputType()
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  bio?: string;

  @PreserveInputType()
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  image?: string;
}

export class UpdateUserDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateUserBodyDto)
  user!: UpdateUserBodyDto;
}
