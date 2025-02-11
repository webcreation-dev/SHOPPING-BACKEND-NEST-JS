import { Exclude } from 'class-transformer';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { RegistryDates } from '../usual/embedded/registry-dates.embedded';

export class AbstractEntity<T> {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column(() => RegistryDates, { prefix: false })
  registryDates: RegistryDates;

  constructor(entity: Partial<T>) {
    Object.assign(this, entity);
  }
}
