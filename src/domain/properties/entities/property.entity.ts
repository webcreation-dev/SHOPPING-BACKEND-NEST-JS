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

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => User, (user) => user.wishlist)
  users: User[];

  @OneToOne(() => Location, (location) => location.property, { cascade: true })
  @JoinColumn()
  location: Location;

  @OneToMany(() => Gallery, (gallery) => gallery.property, { cascade: true })
  galleries: Gallery[];
}
