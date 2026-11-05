import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { LoginUserPort } from '@application/ports/inbound/auth/login-user.port';
import type { RegisterUserPort } from '@application/ports/inbound/auth/register-user.port';
import { LOGIN_USER_PORT, REGISTER_USER_PORT } from '@application/ports/tokens';
import { LoginUserDto } from '@presentation/api/dtos/auth/login-user.dto';
import { RegisterUserDto } from '@presentation/api/dtos/auth/register-user.dto';
import { UserResponseDto } from '@presentation/api/dtos/auth/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(REGISTER_USER_PORT)
    private readonly registerUserPort: RegisterUserPort,
    @Inject(LOGIN_USER_PORT)
    private readonly loginUserPort: LoginUserPort,
  ) {}

  @Post()
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    const result = await this.registerUserPort.execute({
      email: dto.user.email,
      username: dto.user.username,
      password: dto.user.password,
    });
    return new UserResponseDto(result);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<UserResponseDto> {
    const result = await this.loginUserPort.execute({
      email: dto.user.email,
      password: dto.user.password,
    });
    return new UserResponseDto(result);
  }
}
