import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { RequestUser } from '../../interfaces/request-user.interface';
import { Request } from 'express';
import { RoleEnum } from '../../enums/role.enum';

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
