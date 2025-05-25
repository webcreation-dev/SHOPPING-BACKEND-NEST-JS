import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
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
  MaxFileCount,
  MULTIPART_FORMDATA_KEY,
  Public,
  RequestUser,
  ResetPasswordDto,
} from '@app/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
import { ApiConsumes } from '@nestjs/swagger';
import { StatContractsMonthDto } from './users/dto/stat-contracts-month.dto';
import { UsersService } from './users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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

  @HeaderOperation('LOGOUT')
  @Post('logout')
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1]; // Récupérer le token JWT
    return await this.authService.logout(token);
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

  @Post('initiate_validation_user')
  @HeaderOperation('INITIATE VALIDATION', InitiateValidationUserDto)
  @ApiConsumes(MULTIPART_FORMDATA_KEY)
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.VALIDATE_ACCOUNT))
  async initiateValidation(
    @Body() initiateValidationUserDto: InitiateValidationUserDto,

    @UploadedFiles(createParseFilePipe('5MB', 'png', 'jpeg'))
    files: File[],

    @CurrentUser() user: User,
  ) {
    return await this.authService.initiateValidation(
      initiateValidationUserDto,
      files,
      user,
    );
  }

  @HeaderOperation('UPDATE PROFILE')
  @UseInterceptors(FilesInterceptor('files', 1))
  @Post('image_profile')
  async updateProfile(
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: File[],
    @CurrentUser() user: User,
  ) {
    return await this.authService.updateProfile(files, user);
  }

  @Get('stat_by_month')
  @HeaderOperation('STAT CONTRACT BY ', StatContractsMonthDto)
  statContractsMonth(
    @CurrentUser() user: User,
    @Query() statContractsMonthDto?: StatContractsMonthDto,
  ) {
    return this.usersService.statContractsMonth(user, statContractsMonthDto);
  }
}
