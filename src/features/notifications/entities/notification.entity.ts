import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { User } from 'src/features/auth/users/entities/user.entity';
import { StatusNotificationEnum } from '../enums/status.notification.enum';
import { TypeNotificationEnum } from '../enums/type.notification.enum';

@Entity()
export class Notification extends AbstractEntity<Notification> {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: StatusNotificationEnum,
    enumName: 'status_notification_enum',
    default: StatusNotificationEnum.NOT_READ,
  })
  status: StatusNotificationEnum;

  @Column({
    type: 'enum',
    enum: TypeNotificationEnum,
    enumName: 'type_notification_enum',
  })
  type: TypeNotificationEnum;

  @Column()
  module_id: number;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;
}
