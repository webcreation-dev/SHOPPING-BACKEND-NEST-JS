import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class SendOtpResponseDto {
  @ApiProperty()
  @IsPhoneNumber('BJ')
  phone: string;
}
