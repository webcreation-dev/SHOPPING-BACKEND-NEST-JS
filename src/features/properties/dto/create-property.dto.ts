import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { WaterMeterTypeEnum } from '../enums/water_meter_type.enum';
import { PaintEnum } from '../enums/paint.enum';
import { SanitaryEnum } from '../enums/sanitary.enum';
import { ElectricityMeterTypeEnum } from '../enums/electricity_meter_type.enum';
import { ElectricityPersonalMeterTypeEnum } from '../enums/electricity_personal_meter_type.enum';

export class CreatePropertyDto {
  @IsNumber()
  @IsNotEmpty()
  number_rooms: number;

  @IsNumber()
  @IsNotEmpty()
  number_living_rooms: number;

  @IsNumber()
  @IsNotEmpty()
  rent_price: number;

  @IsBoolean()
  @IsNotEmpty()
  is_prepaid: boolean;

  @IsNumber()
  @IsNotEmpty()
  month_advance: number;

  @IsNumber()
  @IsNotEmpty()
  number_households: number;

  @IsBoolean()
  @IsNotEmpty()
  is_terace: boolean;

  @IsBoolean()
  @IsNotEmpty()
  is_fence: boolean;

  @IsNumber()
  @IsNotEmpty()
  water_commission: number;

  @IsEnum(PaintEnum)
  @IsNotEmpty()
  paint: PaintEnum;

  @IsEnum(SanitaryEnum)
  @IsNotEmpty()
  sanitary: SanitaryEnum;

  @IsEnum(WaterMeterTypeEnum)
  @IsNotEmpty()
  water_meter_type: WaterMeterTypeEnum;

  @ValidateIf((o) => o.water_meter_type === WaterMeterTypeEnum.FORAGE)
  @IsNumber()
  @IsNotEmpty()
  water_drilling_rate: number;

  @IsNumber()
  @IsNotEmpty()
  electricity_commission: number;

  @IsEnum(ElectricityMeterTypeEnum)
  @IsNotEmpty()
  electricity_meter_type: ElectricityMeterTypeEnum;

  @ValidateIf(
    (o) => o.electricity_meter_type === ElectricityMeterTypeEnum.DECOUNTER,
  )
  @IsNumber()
  @IsNotEmpty()
  electricity_decounter_meter_rate: number;

  @ValidateIf(
    (o) => o.electricity_meter_type === ElectricityMeterTypeEnum.PERSONAL,
  )
  @IsEnum(ElectricityPersonalMeterTypeEnum)
  @IsNotEmpty()
  electricity_personal_meter_type: ElectricityPersonalMeterTypeEnum;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  visit_price: number;

  @IsString()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  latitude: number;
}
