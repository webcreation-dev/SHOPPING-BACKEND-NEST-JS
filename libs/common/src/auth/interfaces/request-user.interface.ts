import { RoleEnum } from '../enums/role.enum';

export interface RequestUser {
  readonly id: number;
  readonly roles: RoleEnum[];
}
