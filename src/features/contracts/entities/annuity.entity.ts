import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Due } from './due.entity';

@Entity()
export class Annuity extends AbstractEntity<Annuity> {
  @Column()
  amount: number;

  @ManyToOne(() => Due, (due) => due.annuities, {
    onDelete: 'CASCADE',
  })
  due: Due;
}
