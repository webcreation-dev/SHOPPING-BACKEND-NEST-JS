import { IsEntity } from '@app/common';

export class ToogleWishlistDto {
  @IsEntity()
  readonly propertyId: number;
}
