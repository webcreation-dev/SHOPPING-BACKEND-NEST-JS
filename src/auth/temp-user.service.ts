import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'domain/users/dto/create-user.dto';

@Injectable()
export class TempUserService {
  private tempUsers: Map<string, CreateUserDto> = new Map();

  storeTempUser(phone: string, userDto: CreateUserDto) {
    this.tempUsers.set(phone, userDto);
  }

  getTempUser(phone: string): CreateUserDto | undefined {
    return this.tempUsers.get(phone);
  }

  removeTempUser(phone: string) {
    this.tempUsers.delete(phone);
  }
}
