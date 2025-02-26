import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { StatusEnum } from '../enums/status.enum';

export class ValidateUserDto {
  @IsEnum(StatusEnum)
  @IsNotEmpty()
  status: StatusEnum;

  @IsNumber()
  readonly user_id: number;
}
