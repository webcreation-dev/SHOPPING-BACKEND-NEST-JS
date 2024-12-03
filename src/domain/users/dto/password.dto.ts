import { IsString } from 'class-validator';
import { IsPassword } from 'common/decorators/validators/is-password.decorator';

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
  readonly password_confirmation: string;
}
