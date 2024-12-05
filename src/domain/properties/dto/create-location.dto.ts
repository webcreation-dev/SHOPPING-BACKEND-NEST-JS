import { IsNotEmpty, IsDecimal } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsDecimal()
  latitude: string;

  @IsNotEmpty()
  @IsDecimal()
  longitude: string;
}
