import { IsOptional, ValidateNested } from 'class-validator';
import { ToFilterOperationDto } from 'querying/decorators/to-filter-operation-dto.decorator';
import { FilterOperationDto } from 'querying/dto/filter-operation.dto';
import { NameFilterDto } from 'querying/dto/name-filter.dto';

export class PropertiesFilterDto extends NameFilterDto {
  @IsOptional()
  @ValidateNested()
  @ToFilterOperationDto()
  readonly price?: FilterOperationDto;
}
