import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @OneToOne(() => Property, (property) => property.location)
  property: Property;
}
