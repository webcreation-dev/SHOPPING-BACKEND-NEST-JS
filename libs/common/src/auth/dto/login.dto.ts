import { IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('BJ')
  readonly phone: string;

  @IsString()
  readonly password: string;
}
