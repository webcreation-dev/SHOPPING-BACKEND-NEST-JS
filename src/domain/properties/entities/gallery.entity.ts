import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Property, (property) => property.galleries, {
    onDelete: 'CASCADE',
  })
  property: Property;
}
