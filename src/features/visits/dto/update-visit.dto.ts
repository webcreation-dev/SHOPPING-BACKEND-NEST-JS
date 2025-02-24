import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../enums/status.enum';

export class UpdateVisitDto {
  @IsDate()
  date: Date;

  @IsEnum(StatusEnum)
  @IsNotEmpty()
  status: StatusEnum;
}
