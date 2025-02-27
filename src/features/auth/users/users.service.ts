import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { RolesRepository } from './roles.repository';
import { NotFoundException } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { RoleEnum } from './enums/role.enum';
import { AppTypeEnum } from './enums/app_type.enum';
import { PropertiesService } from 'src/features/properties/properties.service';
import { ToggleWishlistDto } from './dto/toggle-wishlist.dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { randomBytes } from 'crypto';

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
    return await this.usersRepository.find({}); // Cela doit renvoyer un tableau
  }

  async create(createUserDto: CreateUserDto) {
    await this.rolesRepository.create(new Role({ name: RoleEnum.USER }));
    await this.rolesRepository.create(new Role({ name: RoleEnum.MANAGER }));
    const user = new User({
      ...createUserDto,
      code: randomBytes(3).toString('hex').toUpperCase(),
      roles: [
        await this.rolesRepository.findOne({
          name: await this.getRole(createUserDto.app_type),
        }),
      ],
    });
    return this.usersRepository.create(user);
  }

  async validateUser(validateUserDto: ValidateUserDto) {
    await this.findOne(validateUserDto.user_id);
    return this.usersRepository.findOneAndUpdate(
      { id: validateUserDto.user_id },
      { status: validateUserDto.status },
    );
  }

  private async getRole($app_type) {
    switch ($app_type) {
      case AppTypeEnum.LOCAPAY:
        return RoleEnum.USER;
      case AppTypeEnum.LOCAPAY_BUSINESS:
        return RoleEnum.MANAGER;
      default:
        throw new NotFoundException(`Invalid user type`);
    }
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
}
