import { IsPhoneNumber } from 'class-validator';
import { IsPassword } from '../../usual/decorators/validators/is-password.decorator';

export class LoginDto {
  @IsPhoneNumber('BR')
  readonly phone: string;

  @IsPassword()
  readonly password: string;
}
