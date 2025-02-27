import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { User } from 'src/features/auth/users/entities/user.entity';
import { Property } from 'src/features/properties/entities/property.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Contract extends AbstractEntity<Contract> {
  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column()
  rent_price: number;

  @Column({ type: 'json', nullable: true })
  articles: {
    id: number;
    title: string;
    content: string;
  }[];

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
}
