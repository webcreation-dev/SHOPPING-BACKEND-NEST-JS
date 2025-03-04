import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { StatusDueEnum } from '../enums/status-due.enum';
import { Contract } from './contract.entity';
import { Annuity } from './annuity.entity';

@Entity()
export class Due extends AbstractEntity<Due> {
  @Column()
  amount_due: number;

  @Column({ default: 0 })
  amount_paid: number;

  @Column({ default: 0 })
  carry_over_amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  due_date: Date;

  @Column({
    type: 'enum',
    enum: StatusDueEnum,
    enumName: 'status_due_enum',
    default: StatusDueEnum.WAITING,
  })
  status_due: StatusDueEnum;

  @ManyToOne(() => Contract, (contract) => contract.dues, {
    onDelete: 'CASCADE',
  })
  contract: Contract;

  @OneToMany(() => Annuity, (annuities) => annuities.due, { nullable: true })
  annuities: Annuity[];
}
