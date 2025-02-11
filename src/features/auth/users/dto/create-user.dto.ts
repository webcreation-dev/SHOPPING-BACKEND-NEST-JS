import { IsStrongPassword } from 'class-validator';
import { IsUnique } from '@app/common';
import { IsEnum, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { User } from '../entities/user.entity';
import { AppTypeEnum } from '../enums/app_type.enum';

export class CreateUserDto {
  @IsPhoneNumber('BJ')
  @IsUnique(User, 'phone', { message: 'Phone already exists' })
  readonly phone: string;

  @IsStrongPassword()
  password: string;

  @IsEnum(AppTypeEnum)
  @IsNotEmpty()
  app_type: AppTypeEnum;
}
