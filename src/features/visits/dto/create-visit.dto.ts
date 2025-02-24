import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateVisitDto {
  @IsNumber()
  @IsNotEmpty()
  property_id: number;
}
