import { IsPhoneNumber, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('BJ')
  readonly phone: string;

  @IsString()
  readonly password: string;

  @IsOptional()
  @IsString()
  readonly fcm_token: string;
}
