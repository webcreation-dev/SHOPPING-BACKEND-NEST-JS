import { Column, Entity, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from '@app/common';
import { RoleEnum } from '../enums/role.enum';

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
