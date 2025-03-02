import { IsString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  x_reference_id: string;
}
