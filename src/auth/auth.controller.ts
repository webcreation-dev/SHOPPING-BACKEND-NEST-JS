import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { CurrentUser } from './decorators/user.decorator';
import { RequestUser } from './interfaces/request-user.interface';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';
import { IdDto } from 'common/dto/id.dto';
import { RoleDto } from './roles/dto/role.dto';
import { Role } from './roles/enums/role.enum';
import { Roles } from './decorators/roles.decorator';
import { ApiBody, ApiOkResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtCookieHeader } from './swagger/jwt-cookie.header';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ headers: JwtCookieHeader })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = this.authService.login(user);
    response.cookie('token', token, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
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
