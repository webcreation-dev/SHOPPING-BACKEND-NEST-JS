import { IsDecimal } from 'class-validator';

export class CreateLocationDto {
  @IsDecimal()
  latitude: number;

  @IsDecimal()
  longitude: number;
}
