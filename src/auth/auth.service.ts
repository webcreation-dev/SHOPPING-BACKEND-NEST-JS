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
import { SaveUserDto } from '../domain/users/dto/save-user.dto';
import { OtpService } from 'otp/otp.service';
import { TempUserService } from './temp-user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly tempUserService: TempUserService,
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
    const { phone } = createUserDto;
    this.tempUserService.storeTempUser(phone, createUserDto);

    // await this.otpService.sendOtp(phone);

    return phone;
  }

  async verifyOtp(saveUserDto: SaveUserDto) {
    const { phone, otp } = saveUserDto;

    const tempUser = this.tempUserService.getTempUser(phone);
    if (!tempUser) {
      throw new UnauthorizedException(
        'No registration process found for this phone number',
      );
    }

    // await this.otpService.verifyOtp(otp, phone);

    const user = await this.usersService.create(tempUser);
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
