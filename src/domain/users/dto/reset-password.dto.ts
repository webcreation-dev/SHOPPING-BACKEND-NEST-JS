import { IntersectionType } from '@nestjs/swagger';
import { ForgotPasswordDto } from './forgot-password.dto';
import { PasswordDto } from './password.dto';
import { OtpDto } from 'otp/dto/otp.dto';

export class ResetPasswordDto extends IntersectionType(
  ForgotPasswordDto,
  PasswordDto,
  OtpDto,
) {}
