import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { StatusEnum } from '../enums/status.enum';
import { User } from 'src/features/auth/users/entities/user.entity';
import { Property } from 'src/features/properties/entities/property.entity';
import { randomBytes } from 'crypto';

@Entity()
export class Visit extends AbstractEntity<Visit> {
  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  date: Date;

  @Column({ default: false })
  is_taken: boolean;

  @Column({ default: false })
  is_paid: boolean;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    enumName: 'status_enum',
    default: StatusEnum.WAITING,
  })
  status: StatusEnum;

  @BeforeInsert()
  generateCode() {
    this.code = randomBytes(4).toString('hex').toUpperCase();
  }

  @ManyToOne(() => User, (user) => user.visits, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Property, (property) => property.visits, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => User, (manager) => manager.visits, { onDelete: 'CASCADE' })
  manager: User;
}
