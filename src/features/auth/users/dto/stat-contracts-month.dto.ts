import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class StatContractsMonthDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @IsInt()
  @Min(2000)
  @IsOptional()
  year?: number;
}
