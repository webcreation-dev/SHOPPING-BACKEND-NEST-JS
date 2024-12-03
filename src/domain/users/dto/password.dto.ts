import { IsString } from 'class-validator';
import { IsPassword } from 'common/decorators/validators/is-password.decorator';
import { Match } from 'common/decorators/validators/match.decorator';

export class PasswordDto {
  /**
   * Requires:
   * 1. 8 to 20 characters
   * 2. At least one
   * - Lowercase letter
   * - Uppercase letter
   * - Number
   * - Special character
   */
  @IsPassword()
  readonly password: string;

  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  readonly password_confirmation: string;
}
