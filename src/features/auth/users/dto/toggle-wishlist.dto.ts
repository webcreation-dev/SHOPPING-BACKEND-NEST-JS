import { IsNumber } from 'class-validator';

export class ToggleWishlistDto {
  @IsNumber()
  readonly property_id: number;
}
