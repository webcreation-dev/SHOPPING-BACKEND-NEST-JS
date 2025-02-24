import { SetMetadata } from '@nestjs/common';
import { NonEmptyArray } from 'libs/common/src/usual/util/array.util';
import { RoleEnum } from '../users/enums/role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: NonEmptyArray<RoleEnum>) =>
  SetMetadata(ROLES_KEY, roles);
