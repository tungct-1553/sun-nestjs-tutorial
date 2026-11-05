import { Body, Controller, Get, Inject, Put, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { GetCurrentUserPort } from '@application/ports/inbound/auth/get-current-user.port';
import type { UpdateUserPort } from '@application/ports/inbound/auth/update-user.port';
import {
  GET_CURRENT_USER_PORT,
  UPDATE_USER_PORT,
} from '@application/ports/tokens';
import type { AuthenticatedRequestUser } from '@presentation/api/decorators/current-user.decorator';
import { CurrentUser } from '@presentation/api/decorators/current-user.decorator';
import { UpdateUserDto } from '@presentation/api/dtos/auth/update-user.dto';
import { UserResponseDto } from '@presentation/api/dtos/auth/user-response.dto';
import { ErrorResponseDto } from '@presentation/api/dtos/common/error-response.dto';
import { JwtAuthGuard } from '@presentation/api/guards/jwt-auth.guard';

@ApiTags('User')
@ApiSecurity('token')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    @Inject(GET_CURRENT_USER_PORT)
    private readonly getCurrentUserPort: GetCurrentUserPort,
    @Inject(UPDATE_USER_PORT)
    private readonly updateUserPort: UpdateUserPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async getCurrentUser(
    @CurrentUser() currentUser: AuthenticatedRequestUser,
  ): Promise<UserResponseDto> {
    const result = await this.getCurrentUserPort.execute(currentUser.userId);
    return new UserResponseDto(result);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'Email or username already taken',
  })
  async updateUser(
    @CurrentUser() currentUser: AuthenticatedRequestUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const result = await this.updateUserPort.execute({
      userId: currentUser.userId,
      email: dto.user.email,
      username: dto.user.username,
      password: dto.user.password,
      bio: dto.user.bio,
      image: dto.user.image,
    });
    return new UserResponseDto(result);
  }
}
