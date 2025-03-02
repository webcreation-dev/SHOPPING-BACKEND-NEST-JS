import { IsString } from 'class-validator';

export class ApiTokenDto {
  @IsString()
  api_token: string;
}
