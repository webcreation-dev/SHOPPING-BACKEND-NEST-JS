import { IsNotEmpty, IsString } from 'class-validator';
import { IsExist } from '@app/common';
import { User } from '../entities/user.entity';

export class SearchUserByCodeDto {
  @IsString()
  @IsNotEmpty()
  @IsExist(User, 'code')
  code: string;
}
