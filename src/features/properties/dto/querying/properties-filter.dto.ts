import {
  FilterOperationDto,
  NameFilterDto,
  ToFilterOperationDto,
} from '@app/common';
import { IsOptional, ValidateNested } from 'class-validator';

export class PropertiesFilterDto extends NameFilterDto {
  @IsOptional()
  @ValidateNested()
  @ToFilterOperationDto()
  readonly price?: FilterOperationDto;
}
