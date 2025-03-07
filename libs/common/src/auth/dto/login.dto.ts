import { IsPhoneNumber, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('BJ')
  readonly phone: string;

  readonly password: string;
}
