import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { CurrentUser } from './decorators/user.decorator';
import { RequestUser } from './interfaces/request-user.interface';
import { Public } from './decorators/public.decorator';
import { IdDto } from 'common/dto/id.dto';
import { RoleDto } from './roles/dto/role.dto';
import { Role } from './roles/enums/role.enum';
import { Roles } from './decorators/roles.decorator';
import { ApiBody, ApiOkResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtCookieHeader } from './swagger/jwt-cookie.header';
import { CreateUserDto } from '../domain/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ headers: JwtCookieHeader })
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const token = await this.authService.register(createUserDto);
    return { access_token: token };
  }

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ headers: JwtCookieHeader })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@CurrentUser() user: RequestUser) {
    const token = this.authService.login(user);
    return { access_token: token };
  }

  @Get('user')
  getProfile(@CurrentUser() { id }: RequestUser) {
    return this.authService.getProfile(id);
  }

  @ApiExcludeEndpoint()
  @Roles(Role.ADMIN)
  @Patch(':id/assign-role')
  assignRole(@Param() { id }: IdDto, @Body() { role }: RoleDto) {
    return this.authService.assignRole(id, role);
  }
}
