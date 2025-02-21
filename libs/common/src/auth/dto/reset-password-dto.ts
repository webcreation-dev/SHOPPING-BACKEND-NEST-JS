import { OtpDto } from '@app/common';
import { IsNumber, IsPhoneNumber, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto extends OtpDto {
  @IsPhoneNumber('BJ')
  readonly phone: string;

  @IsNumber()
  readonly otp: number;

  @IsStrongPassword()
  readonly password: string;
}
