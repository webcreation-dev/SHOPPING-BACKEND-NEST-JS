import { IsEnum, IsOptional } from 'class-validator';
import { StatusEnum } from '../enums/status.enum';

export class VisitsFilterDto {
  @IsOptional()
  @IsEnum(StatusEnum)
  readonly status?: StatusEnum;
}
