import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IdDto } from 'common/dto/id.dto';
import { Public } from 'auth/decorators/public.decorator';
import { Role } from 'auth/roles/enums/role.enum';
import { Roles } from 'auth/decorators/roles.decorator';
import { CurrentUser } from 'auth/decorators/user.decorator';
import { RequestUser } from 'auth/interfaces/request-user.interface';
import { LoginDto } from 'auth/dto/login.dto';
import { PaginationDto } from 'querying/dto/pagination.dto';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('/:id')
  findOne(@Param() { id }: IdDto) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param() { id }: IdDto,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param() { id }: IdDto,
    @Query() soft: boolean,
    @CurrentUser() user: RequestUser,
  ) {
    return this.usersService.remove(id, soft, user);
  }

  @Public()
  @Patch('recover')
  recover(@Body() loginDto: LoginDto) {
    return this.usersService.recover(loginDto);
  }
}
