import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RequestUser, RoleEnum } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { OtpService } from '@app/common';
import { SaveUserDto } from './users/dto/save-user-dto';
import { CreateUserDto } from './users/dto/create-user.dto';
import { User } from './users/entities/user.entity';
import { HashingService } from './hashing/hashing.service';
import { TempUserService } from './users/temps/temp-user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

    // private readonly usersRepository: UsersRepository,
    private readonly tempUserService: TempUserService,
    private readonly hashingService: HashingService,
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
  ) {}

  async login(user: RequestUser) {
    const payload: JwtPayload = { sub: user.id };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_TTL'),
    );

    return this.jwtService.sign(payload);
  }

  async register(createUserDto: CreateUserDto) {
    const { phone } = createUserDto;

    this.tempUserService.storeTempUser(phone, createUserDto);

    await this.otpService.sendOtp(phone);

    return phone;
  }

  async verifyOtp(saveUserDto: SaveUserDto) {
    const { phone, otp } = saveUserDto;

    // await this.otpService.verifyOtp(otp, phone);

    const tempUser = this.tempUserService.getTempUser(phone);
    if (!tempUser) {
      throw new UnauthorizedException(
        'No registration process found for this phone number',
      );
    }

    const user = await this.usersService.create(tempUser);

    const rolesEnum: RoleEnum[] = user.roles.map((role) => {
      return role.name as RoleEnum;
    });

    const currentUser: RequestUser = { id: user.id, roles: rolesEnum };

    const jwt = await this.login(currentUser);
    return jwt;
  }

  async validateLocal(phone: string, password: string) {
    // const user = await this.usersRepository.findOne({ phone });
    // const isMatch = await this.hashingService.compare(password, user.password);
    // if (!isMatch) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }
    // return this.createRequestUser(user);
  }

  async validateJwt(payload: JwtPayload) {
    // return this.usersRepository.findOne({ id: payload.sub }, { roles: true });
  }

  private createRequestUser(user: User) {
    const { id, roles } = user;

    const rolesEnum = roles.map((role) => role.name as RoleEnum);

    const requestUser: RequestUser = { id, roles: rolesEnum };

    return requestUser;
  }

  async validateToken(jwt: string) {
    const payload: JwtPayload = this.jwtService.verify(jwt);
    // return this.usersRepository.findOne({ id: payload.sub }, { roles: true });
  }

  // async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
  //   const { phone } = forgotPasswordDto;
  //   await this.otpService.sendOtp(phone);
  //   return phone;
  // }

  // async resetPassword(resetPasswordDto: ResetPasswordDto) {
  //   const { phone, otp, password } = resetPasswordDto;

  //   await this.otpService.verifyOtp(otp, phone);

  //   const user = await this.usersRepository.findOne({ where: { phone } });
  //   user.password = await this.hashingService.hash(password);
  //   await this.usersRepository.save(user);

  //   return user;
  // }

  // async getUser(user: User) {
  //   const CurrentUser = await this.usersService.getUser(user);
  //   return CurrentUser;
  // }

  // async toogleWishlist(user: User, toogleWishlistDto: toogleWishlistDto) {
  //   return await this.usersService.toogleWishlist(user, toogleWishlistDto);
  // }
}
