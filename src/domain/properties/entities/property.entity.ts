import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'users/entities/user.entity';
import { Location } from './location.entity';
import { Gallery } from './gallery.entity';
import { RegistryDates } from 'common/embedded/registry-dates.embedded';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  price: number;

  @Column(() => RegistryDates, { prefix: false })
  registryDates: RegistryDates;

  @ManyToMany(() => User, (user) => user.wishlist)
  users: User[];

  @OneToOne(() => Location, (location) => location.property, { cascade: true })
  @JoinColumn()
  location: Location;

  @OneToMany(() => Gallery, (gallery) => gallery.property, { cascade: true })
  galleries: Gallery[];
}
