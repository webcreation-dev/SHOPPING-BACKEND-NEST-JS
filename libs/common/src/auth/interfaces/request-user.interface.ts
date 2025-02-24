import { RoleEnum } from 'src/features/auth/users/enums/role.enum';

export interface RequestUser {
  readonly id: number;
  readonly roles: RoleEnum[];
}
