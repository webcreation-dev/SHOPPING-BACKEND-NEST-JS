import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { HeaderOperation } from '@app/common';
import { ValidateUserDto } from './dto/validate-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HeaderOperation('VALIDATE USER', ValidateUserDto)
  @Post('validate_user')
  async validateUser(@Body() validateUserDto: ValidateUserDto) {
    return this.usersService.validateUser(validateUserDto);
  }
}
