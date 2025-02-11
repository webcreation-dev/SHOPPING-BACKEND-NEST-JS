import { IdDto, IsEntity } from '@app/common';

export class toogleWishlistDto {
  @IsEntity()
  readonly propertyId: IdDto;
}
