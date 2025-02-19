import { OrderDto } from '@app/common';
import { IsIn, IsOptional } from 'class-validator';

const Sort = ['description', 'rent_price'] as const;
type Sort = (typeof Sort)[number];

export class PropertiesSortDto extends OrderDto {
  @IsOptional()
  @IsIn(Sort)
  readonly sort?: Sort = 'rent_price';
}
