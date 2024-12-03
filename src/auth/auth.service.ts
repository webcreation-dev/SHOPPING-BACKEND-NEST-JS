import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { HashingService } from './hashing/hashing.service';
import { RequestUser } from './interfaces/request-user.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from './roles/enums/role.enum';
import { UsersService } from '../domain/users/users.service';
import { CreateUserDto } from '../domain/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateLocal(phone: number, password: string) {
    const user = await this.usersRepository.findOne({
      select: {
        id: true,
        password: true,
      },
      where: { phone: phone.toString() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.hashingService.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createRequestUser(user);
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const currentUser: RequestUser = { id: user.id, role: user.role };
    const token = await this.login(currentUser);
    return token;
  }

  login(user: RequestUser) {
    const payload: JwtPayload = { sub: user.id };
    return this.jwtService.sign(payload);
  }

  async validateJwt(payload: JwtPayload) {
    const user = await this.usersRepository.findOneBy({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.createRequestUser(user);
  }

  getProfile(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async assignRole(id: number, role: Role) {
    const user = await this.usersRepository.preload({
      id,
      role,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.save(user);
  }

  private createRequestUser(user: User) {
    const { id, role } = user;
    const requestUser: RequestUser = { id, role };
    return requestUser;
  }
}
