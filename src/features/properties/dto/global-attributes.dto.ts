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
import { IsExist } from '@app/common';
import { User } from 'src/features/auth/users/entities/user.entity';

export class GlobalAttributes {
  @IsBoolean()
  @IsNotEmpty()
  to_sell: boolean;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsString()
  @IsNotEmpty()
  @IsExist(User, 'code')
  owner_code: string;

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

  @IsNumber()
  @IsNotEmpty()
  management_fee: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  house_name: string;

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
