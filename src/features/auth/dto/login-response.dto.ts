import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';

export class LoginResponseDto extends User {
  @ApiProperty()
  token: string;
}
