import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { LoginUserPort } from '@application/ports/inbound/auth/login-user.port';
import type { RegisterUserPort } from '@application/ports/inbound/auth/register-user.port';
import { LOGIN_USER_PORT, REGISTER_USER_PORT } from '@application/ports/tokens';
import { LoginUserDto } from '@presentation/api/dtos/auth/login-user.dto';
import { RegisterUserDto } from '@presentation/api/dtos/auth/register-user.dto';
import { UserResponseDto } from '@presentation/api/dtos/auth/user-response.dto';
import { ErrorResponseDto } from '@presentation/api/dtos/common/error-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject(REGISTER_USER_PORT)
    private readonly registerUserPort: RegisterUserPort,
    @Inject(LOGIN_USER_PORT)
    private readonly loginUserPort: LoginUserPort,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'Email or username already taken',
  })
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    const result = await this.registerUserPort.execute({
      email: dto.user.email,
      username: dto.user.username,
      password: dto.user.password,
    });
    return new UserResponseDto(result);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginUserDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiForbiddenResponse({
    type: ErrorResponseDto,
    description: 'Invalid email or password',
  })
  async login(@Body() dto: LoginUserDto): Promise<UserResponseDto> {
    const result = await this.loginUserPort.execute({
      email: dto.user.email,
      password: dto.user.password,
    });
    return new UserResponseDto(result);
  }
}
