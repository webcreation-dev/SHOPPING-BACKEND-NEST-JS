import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from 'libs/common/src/auth/config/jwt.config';
import { JwtPayload } from '@app/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req) => {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        console.log('Jeton JWT extrait:', token, jwtConfiguration.secret);
        return token;
      },
      secretOrKey: jwtConfiguration.secret,
    });
  }

  validate(payload: JwtPayload) {
    console.log('Payload reçu:', payload);
    return this.authService.validateJwt(payload);
  }
}
