import { IsEnum, IsNotEmpty } from 'class-validator';
import { GlobalAttributes } from './global-attributes.dto';
import { TypePropertyEnum } from '../enums/type_property.enum';
import { IntersectionType } from '@nestjs/swagger';
import { SpecificAttributes } from './specific-attributes.dto';

export class CreatePropertyDto extends IntersectionType(
  GlobalAttributes,
  SpecificAttributes,
) {
  @IsEnum(TypePropertyEnum)
  @IsNotEmpty()
  type: TypePropertyEnum;
}
