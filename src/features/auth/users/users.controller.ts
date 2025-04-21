import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { HeaderOperation } from '@app/common';
import { ValidateUserDto } from './dto/validate-user.dto';
import { SearchUserByCodeDto } from './dto/search-user-by-code.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HeaderOperation('VALIDATE USER', ValidateUserDto)
  @Post('validate_user')
  async validateUser(@Body() validateUserDto: ValidateUserDto) {
    return this.usersService.validateUser(validateUserDto);
  }

  @HeaderOperation('GET ALL')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('search_user_by_code')
  @HeaderOperation('SEARCH USER BY CODE', SearchUserByCodeDto)
  searchUserByCode(@Body() searchUserByCodeDto: SearchUserByCodeDto) {
    return this.usersService.searchUserByCode(searchUserByCodeDto);
  }
}
