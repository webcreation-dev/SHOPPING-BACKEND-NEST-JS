import { Role } from 'auth/roles/enums/role.enum';
import { Exclude } from 'class-transformer';
import { RegistryDates } from 'common/embedded/registry-dates.embedded';
import { Order } from 'orders/entities/order.entity';
import { Property } from 'properties/entities/property.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  // @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    enumName: 'role_enum',
    default: Role.ADMIN,
  })
  role: Role;

  @Column(() => RegistryDates, { prefix: false })
  registryDates: RegistryDates;

  @OneToMany(() => Order, (order) => order.customer, {
    cascade: ['soft-remove', 'recover'],
  })
  orders: Order[];

  @ManyToMany(() => Property, (property) => property.users)
  wishlist: Property[];

  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];

  get isDeleted() {
    return !!this.registryDates.deletedAt;
  }
}
