import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { RequestUser } from '../../interfaces/request-user.interface';
import { Request } from 'express';
import { RoleEnum } from '../../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupérer les rôles requis à partir des métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true; // Si aucun rôle n'est requis, autoriser l'accès

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as RequestUser;

    // Vérifier si l'utilisateur possède l'un des rôles requis
    const hasRequiredRole = requiredRoles.some(
      (role) => user.roles.includes(role), // Vérifier directement si le rôle de l'utilisateur existe dans les rôles requis
    );
    return hasRequiredRole;
  }
}
