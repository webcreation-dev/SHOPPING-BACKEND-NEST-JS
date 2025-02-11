import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'libs/common/src';
import { NonEmptyArray } from 'libs/common/src/usual/util/array.util';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: NonEmptyArray<RoleEnum>) =>
  SetMetadata(ROLES_KEY, roles);
