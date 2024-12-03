import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from './create-location.dto';
import { CreateGalleryDto } from './create-gallery.dto';

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGalleryDto)
  galleries: CreateGalleryDto[];
}
