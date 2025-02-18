import { Entity, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { AbstractEntity } from '@app/common';

@Entity()
export class Gallery extends AbstractEntity<Gallery> {
  @Column()
  url: string;

  @ManyToOne(() => Property, (property) => property.galleries, {
    onDelete: 'CASCADE',
  })
  property: Property;
}
