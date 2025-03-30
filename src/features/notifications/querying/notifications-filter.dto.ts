import { IsEnum, IsOptional } from 'class-validator';
import { TypeNotificationEnum } from '../enums/type.notification.enum';
import { StatusNotificationEnum } from '../enums/status.notification.enum';

export class NotificationsFilterDto {
  @IsOptional()
  @IsEnum(StatusNotificationEnum)
  readonly status?: StatusNotificationEnum;

  @IsOptional()
  @IsEnum(TypeNotificationEnum)
  readonly type?: TypeNotificationEnum;
}
