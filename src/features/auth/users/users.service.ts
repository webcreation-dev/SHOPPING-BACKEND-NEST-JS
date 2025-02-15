import { Injectable } from '@nestjs/common';
import { RoleEnum, AppTypeEnum } from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { RolesRepository } from './roles.repository';
import { NotFoundException } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
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
      roles: [
        await this.rolesRepository.findOne({
          name: await this.getRole(createUserDto.app_type),
        }),
      ],
    });
    return this.usersRepository.create(user);
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
    const user = await this.usersRepository.findOne({ id }, { roles: true });
    return user;
  }
}
