import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { RolesRepository } from './roles.repository';
import { User } from './entities/user.entity';
import { PropertiesService } from 'src/features/properties/properties.service';
import { ToggleWishlistDto } from './dto/toggle-wishlist.dto';
import { ValidateUserDto } from './dto/validate-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    @Inject(forwardRef(() => PropertiesService))
    private readonly propertiesService: PropertiesService,
  ) {}

  async findOne(id: number) {
    return this.usersRepository.findOne({ id });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({});
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

  async getUser({ id }: User) {
    const userData = await this.usersRepository.findOne(
      { id },
      { roles: true },
    );
    return {
      user: userData,
      wishlist: await this.propertiesService.findMany(
        userData.wishlistedProperties,
      ),
    };
  }

  async toogleWishlist(user: User, toggleWishlistDto: ToggleWishlistDto) {
    return await this.propertiesService.toogleWishlist(user, toggleWishlistDto);
  }

  async getWishlist(user: User) {
    return await this.propertiesService.getWishlist(user);
  }
}
