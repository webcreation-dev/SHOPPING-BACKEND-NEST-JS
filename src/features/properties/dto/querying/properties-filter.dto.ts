import {
  FilterOperationDto,
  NameFilterDto,
  ToFilterOperationDto,
} from '@app/common';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TarificationEnum } from '../../enums/tarification.enum';
import { TypePropertyEnum } from '../../enums/type_property.enum';

export class PropertiesFilterDto extends NameFilterDto {
  @IsOptional()
  @ValidateNested()
  @ToFilterOperationDto()
  readonly price?: FilterOperationDto;

  @IsOptional()
  @IsEnum(TarificationEnum)
  readonly tarification?: TarificationEnum;

  @IsOptional()
  @IsEnum(TypePropertyEnum)
  readonly type?: TypePropertyEnum;

  @IsNumber()
  @Min(0)
  @Max(1)
  readonly to_sell?: number;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  municipality?: string;

  @IsString()
  @IsOptional()
  department?: string;
}
