import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    const user = await this.userService.findById(payload.sub);
    console.log('User found:', user ? `ID: ${user.id}` : 'null');
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return { id: user.id, email: user.email, name: user.name };
  }
}
