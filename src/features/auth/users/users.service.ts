import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { PropertiesService } from 'src/features/properties/properties.service';
import { ToggleWishlistDto } from './dto/toggle-wishlist.dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { UserResource } from 'src/features/auth/resources/user.resource';
import { SearchUserByCodeDto } from './dto/search-user-by-code.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => PropertiesService))
    private readonly propertiesService: PropertiesService,
    private readonly userResource: UserResource,
  ) {}

  async findOne(id: number) {
    return this.userResource.format(
      await this.usersRepository.findOne(
        { id },
        {
          roles: true,
          properties: true,
          ownProperties: true,
          visits: true,
          managedVisits: true,
          ownerContracts: true,
          contracts: true,
        },
      ),
    );
  }

  async findAll(): Promise<any> {
    return this.userResource.formatCollection(
      await this.usersRepository.find({}),
    );
  }

  async searchUserByCode({ code }: SearchUserByCodeDto) {
    const user = await this.usersRepository.findOne({ code });
    return await this.findOne(user.id);
  }

  async create(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);
    return this.usersRepository.create(user);
  }

  async validateUser(validateUserDto: ValidateUserDto) {
    await this.findOne(validateUserDto.user_id);
    return this.usersRepository.findOneAndUpdate(
      { id: validateUserDto.user_id },
      { status: validateUserDto.status },
    );
  }

  async toogleWishlist(user: User, toggleWishlistDto: ToggleWishlistDto) {
    return await this.propertiesService.toogleWishlist(user, toggleWishlistDto);
  }

  async getWishlist(user: User) {
    return await this.propertiesService.getWishlist(user);
  }
}
