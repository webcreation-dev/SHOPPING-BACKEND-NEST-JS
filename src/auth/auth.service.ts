import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { HashingService } from './hashing/hashing.service';
import { RequestUser } from './interfaces/request-user.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocal(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      select: {
        id: true,
        password: true,
      },
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.hashingService.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const requestUser: RequestUser = { id: user.id };
    return requestUser;
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

    const requestUser: RequestUser = { id: payload.sub };
    return requestUser;
  }

  getProfile(id: number) {
    return this.usersRepository.findOneBy({ id });
  }
}
