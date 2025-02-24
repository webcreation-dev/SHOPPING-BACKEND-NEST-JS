import { IsNumber } from 'class-validator';

export class ToggleWishlistDto {
  // @IsEntity()
  @IsNumber()
  readonly property_id: number;
}
