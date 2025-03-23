import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  createParseFilePipe,
  File,
  ForgotPasswordDto,
  HeaderOperation,
  LoginDto,
  Public,
  RequestUser,
  ResetPasswordDto,
} from '@app/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './users/dto/create-user.dto';
import { SaveUserDto } from './users/dto/save-user-dto';
import { CurrentUser } from './decorators/user.decorator';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { User } from './users/entities/user.entity';
import { LoginResponseDto } from 'src/features/auth/dto/login-response.dto';
import { SendOtpResponseDto } from './dto/send-otp-response.dto';
import { ToggleWishlistDto } from './users/dto/toggle-wishlist.dto';
import { CurrentUserResponseDto } from './dto/current_user-response.dto';
import { InitiateValidationUserDto } from './users/dto/initiate-validation-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HeaderOperation('LOGIN', LoginDto, LoginResponseDto, true)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: RequestUser): Promise<any> {
    return await this.authService.login(user);
  }

  @HeaderOperation('REGISTER', CreateUserDto, SendOtpResponseDto, true)
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @HeaderOperation('VERIFY OTP', SaveUserDto, LoginResponseDto, true)
  @Post('verify_otp')
  async verifyOtp(@Body() saveUserDto: SaveUserDto) {
    return await this.authService.verifyOtp(saveUserDto);
  }

  @HeaderOperation('GET USER', null, CurrentUserResponseDto)
  @Get('user')
  async getUser(@CurrentUser() user: User) {
    return await this.authService.getUser(user);
  }

  @HeaderOperation(
    'FORGOT PASSWORD',
    ForgotPasswordDto,
    SendOtpResponseDto,
    true,
  )
  @Post('forgot_password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @HeaderOperation('RESET PASSWORD', ResetPasswordDto, null, true)
  @Post('reset_password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @HeaderOperation('TOGGLE WISHLIST', ToggleWishlistDto, null)
  @Post('toggle_wishlist')
  async addWishlist(
    @Body() toggleWishlistDto: ToggleWishlistDto,
    @CurrentUser() user: User,
  ) {
    return await this.authService.toogleWishlist(user, toggleWishlistDto);
  }

  @HeaderOperation('GET WISHLIST')
  @Get('wishlist')
  async getWishlist(@CurrentUser() user: User) {
    return await this.authService.getWishlist(user);
  }

  // @HeaderOperation('INITIATE VALIDATION', InitiateValidationUserDto)
  // @UseInterceptors(FileInterceptor('card_image'))
  // @UseInterceptors(FileInterceptor('siganture'))
  // @Patch('initiate_validation_user')
  // async initiateValidation(
  //   @Body() initiateValidationUserDto: InitiateValidationUserDto,
  //   @UploadedFile(createParseFilePipe('2MB', 'png', 'jpeg')) card_image: File,
  //   @UploadedFile(createParseFilePipe('2MB', 'png', 'jpeg')) siganture: File,
  //   @CurrentUser() user: User,
  // ) {
  //   return await this.authService.initiateValidation(
  //     initiateValidationUserDto,
  //     card_image,
  //     user,
  //   );
  // }

  @HeaderOperation('UPDATE PROFILE')
  @UseInterceptors(FileInterceptor('image'))
  @Patch('image_profile')
  async updateProfile(
    @UploadedFile(createParseFilePipe('2MB', 'png', 'jpeg')) image: File,
    @CurrentUser() user: User,
  ) {
    return await this.authService.updateProfile(image, user);
  }
}
