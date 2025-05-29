import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from 'src/features/auth/users/entities/user.entity';
import { Contract } from 'src/features/contracts/entities/contract.entity';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { PaymentTypeEnum } from '../enums/payment-type.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { AbstractEntity } from 'libs/common/src/database/abstract.entity';

@Entity()
export class Transaction extends AbstractEntity<Transaction> {
  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentTypeEnum,
    enumName: 'payment_type_enum',
  })
  payment_type: PaymentTypeEnum;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => Contract, (contract) => contract.transactions, {
    nullable: true,
  })
  contract: Contract;

  @Column({ type: 'json', nullable: true })
  meta: Record<string, any>;

  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
    enumName: 'payment_method_enum',
  })
  payment_method: PaymentMethodEnum;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    enumName: 'payment_status_enum',
    default: PaymentStatusEnum.PENDING,
  })
  payment_status: PaymentStatusEnum;
}
