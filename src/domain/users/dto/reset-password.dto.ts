import { IntersectionType } from '@nestjs/mapped-types';
import { ForgotPasswordDto } from './forgot-password.dto';
import { PasswordDto } from './password.dto';

export class ResetPasswordDto extends IntersectionType(
  ForgotPasswordDto,
  PasswordDto,
) {}
