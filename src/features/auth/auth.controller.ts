import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  HeaderOperation,
  JwtCookieHeader,
  LoginDto,
  Public,
  RequestUser,
  ResetPasswordDto,
} from '@app/common';
import { CreateUserDto } from './users/dto/create-user.dto';
import { SaveUserDto } from './users/dto/save-user-dto';
import { CurrentUser } from './decorators/user.decorator';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { User } from './users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HeaderOperation('LOGIN', LoginDto, true)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: RequestUser) {
    const jwt = await this.authService.login(user);
    return { access_token: jwt };
  }

  @HeaderOperation('REGISTER', CreateUserDto, true)
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const phone = await this.authService.register(createUserDto);
    return phone;
    return true;
  }

  @HeaderOperation('VERIFY OTP', SaveUserDto, true)
  @Post('verify_otp')
  async verifyOtp(@Body() saveUserDto: SaveUserDto) {
    const user = await this.authService.verifyOtp(saveUserDto);
    return { subscribed: user };
  }

  @HeaderOperation('GET USER')
  @Get('user')
  async getUser(@CurrentUser() user: User) {
    return await this.authService.getUser(user);
  }

  @HeaderOperation('FORGOT PASSWORD', ForgotPasswordDto, true)
  @Post('forgot_password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @HeaderOperation('RESET PASSWORD', ResetPasswordDto, true)
  @Post('reset_password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // @Post('toogle_wishlist')
  // async addWishlist(
  //   @Body() toogleWishlistDto: toogleWishlistDto,
  //   @CurrentUser() user: User,
  // ) {
  //   return await this.authService.toogleWishlist(user, toogleWishlistDto);
  // }
}
