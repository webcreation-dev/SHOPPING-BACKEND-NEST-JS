import { IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpDto } from 'libs/common/src/otp/dto/otp.dto';

export class SaveUserDto extends OtpDto {
  @ApiProperty()
  @IsPhoneNumber('BJ')
  readonly phone: string;
}
