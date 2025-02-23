import { IsString, IsStrongPassword } from 'class-validator';
import { IsUnique } from '@app/common';
import { IsEnum, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { User } from '../entities/user.entity';
import { AppTypeEnum } from '../enums/app_type.enum';
import { SexeEnum } from '../enums/sexe.enum';

export class CreateUserDto {
  @IsString()
  readonly lastname: string;

  @IsString()
  readonly firstname: string;

  @IsPhoneNumber('BJ')
  @IsUnique(User, 'phone', { message: 'Phone already exists' })
  readonly phone: string;

  @IsEnum(SexeEnum)
  @IsNotEmpty()
  sexe: SexeEnum;

  @IsStrongPassword()
  password: string;

  @IsEnum(AppTypeEnum)
  @IsNotEmpty()
  app_type: AppTypeEnum;
}
