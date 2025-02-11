import { IsIn, IsNumber } from 'class-validator';
import { ValidateFilterOperandsLength } from '../decorators/validate-filter-operands-length.decorator';

const Operator = ['gt', 'gte', 'lt', 'lte', 'eq', 'btw'] as const;
type Operator = (typeof Operator)[number];

export class FilterOperationDto {
  @IsIn(Operator)
  readonly operator: Operator;

  @IsNumber({}, { each: true })
  readonly operands: number[];

  @ValidateFilterOperandsLength()
  private readonly manyFieldValidation: any;
}
