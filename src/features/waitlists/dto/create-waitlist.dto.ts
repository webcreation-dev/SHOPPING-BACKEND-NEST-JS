import { IsBoolean, IsString } from 'class-validator';

export class CreateWaitlistDto {
  @IsString()
  readonly lastname: string;

  @IsString()
  readonly firstname: string;

  @IsString()
  readonly phone: string;

  @IsString()
  readonly email: string;

  @IsString()
  readonly business_sector: string;

  @IsString()
  readonly category: string;

  @IsString()
  readonly expectations: string;

  @IsBoolean()
  readonly used_infos: boolean;
}
