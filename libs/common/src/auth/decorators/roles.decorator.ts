import { SetMetadata } from '@nestjs/common';
import { NonEmptyArray } from '../../usual/util/array.util';
import { RoleEnum } from 'src/features/auth/users/enums/role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: NonEmptyArray<RoleEnum>) =>
  SetMetadata(ROLES_KEY, roles);
