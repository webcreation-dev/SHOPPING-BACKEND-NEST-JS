import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';

export class LoginResponseDto {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty()
  access_token: string;
}
