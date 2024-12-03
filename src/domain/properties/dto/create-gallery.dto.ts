import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}
