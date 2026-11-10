import { ApiProperty } from '@nestjs/swagger';
import { ProfileResult } from '@application/ports/inbound/profile/profile.port';

export class ProfileDto {
  @ApiProperty() username!: string;
  @ApiProperty({ nullable: true }) bio!: string | null;
  @ApiProperty({ nullable: true }) image!: string | null;
  @ApiProperty() following!: boolean;

  constructor(profile: ProfileResult) {
    this.username = profile.username;
    this.bio = profile.bio;
    this.image = profile.image;
    this.following = profile.following;
  }
}

export class ProfileResponseDto {
  @ApiProperty({ type: ProfileDto }) profile: ProfileDto;

  constructor(profile: ProfileResult) {
    this.profile = new ProfileDto(profile);
  }
}
