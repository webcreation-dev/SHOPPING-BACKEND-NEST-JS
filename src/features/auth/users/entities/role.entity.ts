import { Column, Entity, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { RoleEnum } from '../enums/role.enum';
import { AbstractEntity } from 'libs/common/src/database/abstract.entity';

@Entity()
export class Role extends AbstractEntity<Role> {
  @Column({
    type: 'enum',
    enum: RoleEnum,
    enumName: 'role_enum',
  })
  name: RoleEnum;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
