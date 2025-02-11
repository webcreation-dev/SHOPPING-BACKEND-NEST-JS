import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { AbstractEntity, AppTypeEnum } from '@app/common';
import { Role } from './role.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @Column({ unique: true })
  phone: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AppTypeEnum,
    enumName: 'app_type_enum',
  })
  app_type: AppTypeEnum;

  @Column('int', { array: true, default: '{}' })
  wishlistedProperties: number[];

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable()
  roles: Role[];
}
