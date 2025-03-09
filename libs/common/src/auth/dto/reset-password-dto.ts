import { OtpDto } from '../../otp/dto/otp.dto';
import { IsPhoneNumber, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto extends OtpDto {
  @ApiProperty()
  @IsPhoneNumber('BJ')
  readonly phone: string;

  @ApiProperty()
  @IsStrongPassword()
  readonly password: string;
}
