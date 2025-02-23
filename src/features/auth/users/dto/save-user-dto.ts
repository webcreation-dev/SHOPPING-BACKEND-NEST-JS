import { OtpDto } from '@app/common';
import { IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveUserDto extends OtpDto {
  @ApiProperty()
  @IsPhoneNumber('BJ')
  readonly phone: string;
}
