import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'users/entities/user.entity';
import { Location } from './location.entity';
import { Gallery } from './gallery.entity';
import { RegistryDates } from 'common/embedded/registry-dates.embedded';
import { Exclude } from 'class-transformer';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  price: number;

  @Exclude()
  @Column(() => RegistryDates, { prefix: false })
  registryDates: RegistryDates;

  @ManyToOne(() => User, (user) => user.properties)
  @JoinColumn({ name: 'user_id' }) // Assure-toi que la clé étrangère est correcte
  owner: User;

  @ManyToMany(() => User, (user) => user.wishlist)
  users: User[];

  @OneToOne(() => Location, (location) => location.property, { cascade: true })
  @JoinColumn()
  location: Location;

  @OneToMany(() => Gallery, (gallery) => gallery.property, { cascade: true })
  galleries: Gallery[];
}
