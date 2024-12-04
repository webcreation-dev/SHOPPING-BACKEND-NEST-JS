import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from './create-location.dto';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  location: CreateLocationDto;
}
