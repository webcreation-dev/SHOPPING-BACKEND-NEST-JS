import { IsString, IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { IsCurrency } from 'common/decorators/validators/is-currency.decorator';
import { CreateLocationDto } from './create-location.dto';
import { FilesSchema } from 'files/swagger/schemas/files.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto extends FilesSchema {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsCurrency()
  readonly price: number;

  // @ValidateNested()
  // @Type(() => CreateLocationDto)
  // location: CreateLocationDto;
}
