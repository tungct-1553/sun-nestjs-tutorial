import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenServicePort } from '@application/ports/outbound/auth/token.service.port';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  sign(userId: string): string {
    const options: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('jwt.secret'),
      expiresIn: this.configService.getOrThrow('jwt.expiresIn'),
    };

    return this.jwtService.sign({ sub: userId }, options);
  }
}
