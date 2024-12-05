import { IsDecimal } from 'class-validator';

export class CreateLocationDto {
  @IsDecimal()
  latitude: string;

  @IsDecimal()
  longitude: string;
}
