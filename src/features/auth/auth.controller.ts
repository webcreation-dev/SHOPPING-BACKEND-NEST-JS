import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtCookieHeader, LoginDto, RequestUser } from '@app/common';
import { CreateUserDto } from './users/dto/create-user.dto';
import { SaveUserDto } from './users/dto/save-user-dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ headers: JwtCookieHeader })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: RequestUser) {
    const jwt = await this.authService.login(user);
    return { access_token: jwt };
  }

  @ApiOperation({ summary: 'Inscription' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ headers: JwtCookieHeader })
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const phone = await this.authService.register(createUserDto);
    return phone;
  }

  // @ApiBody({ type: SaveUserDto })
  // @ApiOkResponse({ headers: JwtCookieHeader })
  // @Public()
  // @Post('verify_otp')
  // async verifyOtp(@Body() saveUserDto: SaveUserDto) {
  //   const user = await this.authService.verifyOtp(saveUserDto);
  //   return { subscribed: user };
  // }

  // @Get('user')
  // async getUser(@CurrentUser() user: User) {
  //   return await this.authService.getUser(user);
  // }

  // @Public()
  // @Post('forgot_password')
  // async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(forgotPasswordDto);
  // }

  // @Public()
  // @Post('reset_password')
  // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  //   return this.authService.resetPassword(resetPasswordDto);
  // }

  // @Post('toogle_wishlist')
  // async addWishlist(
  //   @Body() toogleWishlistDto: toogleWishlistDto,
  //   @CurrentUser() user: User,
  // ) {
  //   return await this.authService.toogleWishlist(user, toogleWishlistDto);
  // }
}
