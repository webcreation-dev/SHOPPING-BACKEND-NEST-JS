import { IsNotEmpty, IsString } from 'class-validator';
import { IsExist } from '@app/common';
import { User } from 'src/features/auth/users/entities/user.entity';

export class AddOwnerDto {
  @IsString()
  @IsNotEmpty()
  @IsExist(User, 'code')
  owner_code: string;
}
