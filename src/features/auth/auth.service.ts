import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  File,
  FilePath,
  JwtPayload,
  RequestUser,
  StorageService,
} from '@app/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { OtpService } from '@app/common';
import { SaveUserDto } from './users/dto/save-user-dto';
import { CreateUserDto } from './users/dto/create-user.dto';
import { User } from './users/entities/user.entity';
import { HashingService } from './hashing/hashing.service';
import { TempUserService } from './users/temps/temp-user.service';
import { ResetPasswordDto } from '../../../libs/common/src/auth/dto/reset-password-dto';
import { ForgotPasswordDto } from '../../../libs/common/src/auth/dto/forgot-password-dto';
import { ToggleWishlistDto } from './users/dto/toggle-wishlist.dto';
import { RoleEnum } from './users/enums/role.enum';
import { InitiateValidationUserDto } from './users/dto/initiate-validation-user.dto';
import { join } from 'path';
import { UsersRepository } from 'src/features/auth/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

    private readonly usersRepository: UsersRepository,
    private readonly tempUserService: TempUserService,
    private readonly hashingService: HashingService,
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly UsersRepository: UsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async login(user: RequestUser) {
    const payload: JwtPayload = { sub: user.id };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_TTL'),
    );
    const userData = await this.usersService.findOne(user.id);

    return { user: userData, access_token: this.jwtService.sign(payload) };
  }

  async register(createUserDto: CreateUserDto) {
    const { phone } = createUserDto;

    this.tempUserService.storeTempUser(phone, createUserDto);

    // await this.otpService.sendOtp(phone);

    return { phone_number: phone };
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
    const user = await this.usersRepository.findOne({ phone }, { roles: true });
    const isMatch = await this.hashingService.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.createRequestUser(user);
  }

  async validateJwt(payload: JwtPayload) {
    return this.usersRepository.findOne({ id: payload.sub }, { roles: true });
  }

  async initiateValidation(
    initiateValidationUserDto: InitiateValidationUserDto,
    card_image: File,
    { id }: User,
  ) {
    return this.usersRepository.findOneAndUpdate(
      { id },
      {
        ...initiateValidationUserDto,
        card_image: await this.uploadImage(id, card_image),
      },
    );
  }

  async uploadImage(id: number, file: File) {
    console.log('card_new_image', file);

    const { BASE, IMAGES } = FilePath.Users;
    const path = join(BASE, id.toString(), IMAGES);

    await this.storageService.createDir(path);

    const savedPath = await this.storageService.saveFile(path, file);
    return savedPath;
  }

  private createRequestUser(user: User) {
    const { id, roles } = user;

    const rolesEnum = roles.map((role) => role.name as RoleEnum);
    const requestUser: RequestUser = { id, roles: rolesEnum };

    return requestUser;
  }

  async validateToken(jwt: string) {
    const payload: JwtPayload = this.jwtService.verify(jwt);
    return this.usersRepository.findOne({ id: payload.sub }, { roles: true });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { phone } = forgotPasswordDto;
    await this.usersRepository.findOne({ phone });
    // await this.otpService.sendOtp(phone);
    return phone;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { phone, otp, password } = resetPasswordDto;

    // await this.otpService.verifyOtp(otp, phone);

    const hashedPassword = await this.hashingService.hash(password);

    return this.usersRepository.findOneAndUpdate(
      { phone },
      { password: hashedPassword },
    );
  }

  async getUser(user: User) {
    const currentUser = await this.usersService.getUser(user);
    return currentUser;
  }

  async toogleWishlist(user: User, toggleWishlistDto: ToggleWishlistDto) {
    return await this.usersService.toogleWishlist(user, toggleWishlistDto);
  }
}
