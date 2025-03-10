import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { TarificationEnum } from '../enums/tarification.enum';

export class GlobalAttributes {
  @IsBoolean()
  @IsNotEmpty()
  to_sell: boolean;

  @IsString()
  @IsOptional()
  video_url?: string;

  @ValidateIf((o) => !o.to_sell)
  @IsEnum(TarificationEnum)
  @IsNotEmpty()
  tarification?: TarificationEnum;

  @IsNumber()
  @IsNotEmpty()
  visit_price: number;

  @IsNumber()
  @IsNotEmpty()
  rent_price: number;

  @IsNumber()
  @IsNotEmpty()
  commission: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

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
