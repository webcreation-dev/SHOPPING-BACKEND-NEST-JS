import { Column, Entity } from 'typeorm';
import { AbstractEntity } from 'libs/common/src/database/abstract.entity';

@Entity()
export class Waitlist extends AbstractEntity<Waitlist> {
  @Column()
  lastname: string;

  @Column()
  firstname: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  business_sector: string;

  @Column()
  category: string;

  @Column()
  expectations: string;

  @Column()
  used_infos: boolean;
}
