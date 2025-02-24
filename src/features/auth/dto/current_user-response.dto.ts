import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { Property } from 'src/features/properties/entities/property.entity';

export class CurrentUserResponseDto {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: () => [Property] })
  wishlist: Property[];
}
