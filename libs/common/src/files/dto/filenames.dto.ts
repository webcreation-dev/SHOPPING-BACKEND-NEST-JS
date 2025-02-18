import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class FilenamesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  filenames: string[];
}
