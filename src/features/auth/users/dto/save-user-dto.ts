import { OtpDto } from '@app/common';
import { IsPhoneNumber } from 'class-validator';

export class SaveUserDto extends OtpDto {
  @IsPhoneNumber('BJ')
  readonly phone: string;
}
