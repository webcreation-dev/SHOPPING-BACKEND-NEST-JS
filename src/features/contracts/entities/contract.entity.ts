import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { User } from 'src/features/auth/users/entities/user.entity';
import { Property } from 'src/features/properties/entities/property.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Due } from './due.entity';
import { StatusContractEnum } from '../enums/status-contract.enum';

@Entity()
export class Contract extends AbstractEntity<Contract> {
  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column()
  rent_price: number;

  @Column()
  caution: number;

  @Column({ type: 'json', nullable: true })
  articles: {
    id: number;
    title: string;
    content: string;
  }[];

  @Column({
    type: 'enum',
    enum: StatusContractEnum,
    enumName: 'status_contract_enum',
    default: StatusContractEnum.PENDING,
  })
  status: StatusContractEnum;

  @ManyToOne(() => Property, (property) => property.contracts, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => User, (landlord) => landlord.contracts, {
    onDelete: 'CASCADE',
  })
  landlord: User;

  @ManyToOne(() => User, (tenant) => tenant.contracts, {
    onDelete: 'CASCADE',
  })
  tenant: User;

  @OneToMany(() => Due, (due) => due.contract, { eager: true })
  dues: Due[];

  @Column({ default: false })
  is_gerant_locapay: boolean;
}
