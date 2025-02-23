import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpDto {
  @ApiProperty()
  @IsNumber()
  readonly otp: number;
}
