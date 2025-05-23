import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  FilesModule,
  JwtStrategy,
  LocalStrategy,
  LoginValidationMiddleware,
  OtpModule,
  THROTTLER_MODULE_OPTIONS,
} from '@app/common';
import jwtConfig from 'libs/common/src/auth/config/jwt.config';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { UsersModule } from './users/users.module';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ThrottlerModule.forRoot(THROTTLER_MODULE_OPTIONS),
    OtpModule,
    UsersModule,
    FilesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    JwtStrategy,
    LocalStrategy,
    TokenBlacklistService,
  ],
  exports: [HashingService, TokenBlacklistService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('auth/login');
  }
}
