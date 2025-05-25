import { IsInt, Min, Max } from 'class-validator';

export class StatContractsMonthDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;
}
