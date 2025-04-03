import { Entity, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { AbstractEntity } from 'libs/common/src/database/abstract.entity';

@Entity()
export class Panorama extends AbstractEntity<Panorama> {
  @Column()
  url: string;

  @ManyToOne(() => Property, (property) => property.panorama, {
    onDelete: 'CASCADE',
  })
  property: Property;
}
