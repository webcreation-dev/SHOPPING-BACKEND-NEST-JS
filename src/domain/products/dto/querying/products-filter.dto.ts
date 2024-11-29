import { IsCurrency, IsOptional } from 'class-validator';
import { IsCardinal } from 'common/decorators/validators/is-cardinal.decorator';
import { NameFilterDto } from 'querying/dto/name-filter.dto';

export class ProductsFilterDto extends NameFilterDto {
  @IsOptional()
  @IsCurrency()
  readonly price?: number;

  @IsOptional()
  @IsCardinal()
  readonly categoryId?: number;
}
