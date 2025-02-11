import { IsNumber } from 'class-validator';

export class OtpDto {
  @IsNumber()
  readonly otp: number;
}
