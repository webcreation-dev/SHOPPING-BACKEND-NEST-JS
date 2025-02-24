import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from '@app/common';
import { Role } from './role.entity';
import { SexeEnum } from '../enums/sexe.enum';
import { Property } from 'src/features/properties/entities/property.entity';
import { AppTypeEnum } from '../enums/app_type.enum';

@Entity()
export class User extends AbstractEntity<User> {
  @Column()
  lastname: string;

  @Column()
  firstname: string;

  @Column({ unique: true })
  phone: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AppTypeEnum,
    enumName: 'app_type_enum',
    default: AppTypeEnum.LOCAPAY,
  })
  app_type: AppTypeEnum;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: SexeEnum,
    enumName: 'sexe_enum',
  })
  sexe: SexeEnum;

  @Column({ nullable: true })
  balance_mtn: string;

  @Column({ nullable: true })
  balance_moov: string;

  @Column('int', { array: true, default: '{}' })
  wishlistedProperties: number[];

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Property, (property) => property.user)
  properties: Property[];
}
