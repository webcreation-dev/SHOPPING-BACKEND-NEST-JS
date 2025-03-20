import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { Role } from './role.entity';
import { SexeEnum } from '../enums/sexe.enum';
import { Property } from 'src/features/properties/entities/property.entity';
import { AppTypeEnum } from '../enums/app_type.enum';
import { Visit } from 'src/features/visits/entities/visit.entity';
import { StatusEnum } from '../enums/status.enum';
import { Contract } from 'src/features/contracts/entities/contract.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @Column()
  lastname: string;

  @Column()
  firstname: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  code: string;

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

  @Column({
    type: 'enum',
    enum: StatusEnum,
    enumName: 'status_user_enum',
    default: StatusEnum.NOT_VERIFIED,
  })
  status: StatusEnum;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  card_image: string;

  @Column({ nullable: true })
  card_number: number;

  @Column({ nullable: true })
  signature: string;

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

  @OneToMany(() => Property, (ownProperties) => ownProperties.owner)
  ownProperties: Property[];

  @OneToMany(() => Visit, (visit) => visit.user)
  visits: Visit[];

  @OneToMany(() => Visit, (visit) => visit.manager)
  managedVisits: Visit[];

  @OneToMany(() => Contract, (contract) => contract.landlord)
  managedContracts: Contract[];

  @OneToMany(() => Contract, (contract) => contract.tenant)
  contracts: Contract[];
}
