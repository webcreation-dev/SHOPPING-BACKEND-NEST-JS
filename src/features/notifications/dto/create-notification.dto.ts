import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/features/auth/users/entities/user.entity';
import { TypeNotificationEnum } from '../enums/type.notification.enum';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  user: User;

  @IsEnum(TypeNotificationEnum)
  @IsNotEmpty()
  type: TypeNotificationEnum;

  @IsNotEmpty()
  @IsNumber()
  module_id: number;
}
