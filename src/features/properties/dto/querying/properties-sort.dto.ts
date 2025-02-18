import { OrderDto } from '@app/common';
import { IsIn, IsOptional } from 'class-validator';

const Sort = ['name', 'price'] as const;
type Sort = (typeof Sort)[number];

export class PropertiesSortDto extends OrderDto {
  @IsOptional()
  @IsIn(Sort)
  readonly sort?: Sort = 'name';
  // commit 1
}
