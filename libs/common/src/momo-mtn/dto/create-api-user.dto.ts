import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateApiUserDto {
  @IsString()
  x_reference_id: string;

  @IsString()
  @Transform(({ value }) => value ?? 'string')
  provider_callback_host: string;
}
