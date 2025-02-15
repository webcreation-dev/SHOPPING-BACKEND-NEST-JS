import { IsPhoneNumber } from 'class-validator';

export class ForgotPasswordDto {
  @IsPhoneNumber('BJ')
  readonly phone: string;
}
