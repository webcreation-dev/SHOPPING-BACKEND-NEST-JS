import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { Request } from 'express';
import { RequestUser } from 'libs/common/src';
import { RoleEnum } from '../../users/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as RequestUser;

    // Vérifier si l'utilisateur possède l'un des rôles requis
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles.includes(role),
    );
    return hasRequiredRole;
  }
}
