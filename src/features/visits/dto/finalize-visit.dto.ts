import { IsString } from 'class-validator';
import { IsBoolean, IsExist } from '@app/common';
import { Visit } from '../entities/visit.entity';

export class FinalizeVisitDto {
  @IsString()
  @IsExist(Visit, 'code')
  code: string;

  @IsBoolean()
  is_taken: boolean;
}
