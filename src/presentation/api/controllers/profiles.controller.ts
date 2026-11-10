import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { ProfilePort } from '@application/ports/inbound/profile/profile.port';
import { PROFILE_PORT } from '@application/ports/tokens';
import {
  type AuthenticatedRequestUser,
  CurrentUser,
} from '@presentation/api/decorators/current-user.decorator';
import { OptionalCurrentUser } from '@presentation/api/decorators/optional-current-user.decorator';
import { ProfileResponseDto } from '@presentation/api/dtos/profile/profile-response.dto';
import { JwtAuthGuard } from '@presentation/api/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@presentation/api/guards/optional-jwt-auth.guard';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(@Inject(PROFILE_PORT) private readonly profile: ProfilePort) {}

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get profile by username' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getProfile(
    @Param('username') username: string,
    @OptionalCurrentUser() viewer: AuthenticatedRequestUser | null,
  ): Promise<ProfileResponseDto> {
    return new ProfileResponseDto(
      await this.profile.getProfile(username, viewer?.userId),
    );
  }

  @Post(':username/follow')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Follow user' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async followUser(
    @Param('username') username: string,
    @CurrentUser() viewer: AuthenticatedRequestUser,
  ): Promise<ProfileResponseDto> {
    return new ProfileResponseDto(
      await this.profile.setFollowing(username, viewer.userId, true),
    );
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Unfollow user' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async unfollowUser(
    @Param('username') username: string,
    @CurrentUser() viewer: AuthenticatedRequestUser,
  ): Promise<ProfileResponseDto> {
    return new ProfileResponseDto(
      await this.profile.setFollowing(username, viewer.userId, false),
    );
  }
}
