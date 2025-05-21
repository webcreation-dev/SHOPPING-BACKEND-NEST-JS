import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { StatusDueEnum } from '../enums/status-due.enum';
import { Contract } from './contract.entity';
import { Annuity } from './annuity.entity';

export type InvoiceItem = {
  id: number;
  title: string;
  amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'PAID';
  carry_over_amount: number;
};

@Entity()
export class Due extends AbstractEntity<Due> {
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

  @Column({ type: 'json', nullable: true })
  invoices: InvoiceItem[];

  @ManyToOne(() => Contract, (contract) => contract.dues, {
    onDelete: 'CASCADE',
  })
  contract: Contract;

  @OneToMany(() => Annuity, (annuity) => annuity.due)
  annuities: Annuity[];
}
