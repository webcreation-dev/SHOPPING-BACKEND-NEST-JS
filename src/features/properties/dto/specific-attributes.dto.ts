import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { PaintEnum } from '../enums/paint.enum';
import { SanitaryEnum } from '../enums/sanitary.enum';
import { WaterMeterTypeEnum } from '../enums/water_meter_type.enum';
import { ElectricityMeterTypeEnum } from '../enums/electricity_meter_type.enum';
import { ElectricityPersonalMeterTypeEnum } from '../enums/electricity_personal_meter_type.enum';
import { TypePropertyEnum } from '../enums/type_property.enum';

function isNotParcel(type: TypePropertyEnum): boolean {
  return type !== TypePropertyEnum.PARCEL;
}

function isNotStudioShopStore(type: TypePropertyEnum): boolean {
  return ![
    TypePropertyEnum.STUDIO,
    TypePropertyEnum.SHOP,
    TypePropertyEnum.STORE,
  ].includes(type);
}

export class SpecificAttributes {
  @ValidateIf(
    (o) => isNotStudioShopStore(o.type) && isNotParcel(o.type) && !o.to_sell,
  )
  @IsNumber()
  @IsNotEmpty()
  number_living_rooms?: number;

  @ValidateIf(
    (o) => isNotStudioShopStore(o.type) && isNotParcel(o.type) && !o.to_sell,
  )
  @IsNumber()
  @IsNotEmpty()
  number_rooms?: number;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsNumber()
  @IsNotEmpty()
  number_bathrooms: number;

  @ValidateIf(
    (o) => isNotParcel(o.type) && isNotStudioShopStore(o.type) && !o.to_sell,
  )
  @IsNumber()
  @IsNotEmpty()
  number_households: number;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsEnum(PaintEnum)
  @IsNotEmpty()
  paint: PaintEnum;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsBoolean()
  @IsNotEmpty()
  is_fence: boolean;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsBoolean()
  @IsNotEmpty()
  is_terace: boolean;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsEnum(SanitaryEnum)
  @IsNotEmpty()
  sanitary: SanitaryEnum;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsEnum(WaterMeterTypeEnum)
  @IsNotEmpty()
  water_meter_type: WaterMeterTypeEnum;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsEnum(ElectricityMeterTypeEnum)
  @IsNotEmpty()
  electricity_meter_type: ElectricityMeterTypeEnum;

  @ValidateIf(
    (o) =>
      o.electricity_meter_type === ElectricityMeterTypeEnum.PERSONAL &&
      isNotParcel(o.type) &&
      !o.to_sell,
  )
  @IsEnum(ElectricityPersonalMeterTypeEnum)
  @IsNotEmpty()
  electricity_personal_meter_type?: ElectricityPersonalMeterTypeEnum;

  @ValidateIf(
    (o) =>
      o.electricity_meter_type === ElectricityMeterTypeEnum.DECOUNTER &&
      isNotParcel(o.type) &&
      !o.to_sell,
  )
  @IsNumber()
  @IsNotEmpty()
  electricity_decounter_meter_rate?: number;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsNumber()
  @IsNotEmpty()
  month_advance: number;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsNumber()
  @IsNotEmpty()
  caution: number;

  @ValidateIf((o) => isNotParcel(o.type) && !o.to_sell)
  @IsBoolean()
  @IsNotEmpty()
  is_prepaid: boolean;

  @ValidateIf(
    (o) =>
      o.water_meter_type === WaterMeterTypeEnum.FORAGE &&
      isNotParcel(o.type) &&
      !o.to_sell,
  )
  @IsNumber()
  @IsNotEmpty()
  water_drilling_rate: number;
}
