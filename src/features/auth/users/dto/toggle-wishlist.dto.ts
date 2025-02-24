import { IdDto, IsEntity } from '@app/common';
import { IsNumber } from 'class-validator';

export class ToggleWishlistDto {
  // @IsEntity()
  @IsNumber()
  readonly propertyId: number;
}
