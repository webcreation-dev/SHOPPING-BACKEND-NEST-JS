import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { Gallery } from './gallery.entity';
import { WaterMeterTypeEnum } from '../enums/water_meter_type.enum';
import { PaintEnum } from '../enums/paint.enum';
import { SanitaryEnum } from '../enums/sanitary.enum';
import { ElectricityMeterTypeEnum } from '../enums/electricity_meter_type.enum';
import { ElectricityPersonalMeterTypeEnum } from '../enums/electricity_personal_meter_type.enum';
import { User } from 'src/features/auth/users/entities/user.entity';

@Entity()
export class Property extends AbstractEntity<Property> {
  @Column()
  number_rooms: number;

  @Column()
  number_living_rooms: number;

  @Column()
  rent_price: number;

  @Column()
  is_prepaid: boolean;

  @Column()
  month_advance: number;

  @Column()
  number_households: number;

  @Column()
  is_terace: boolean;

  @Column()
  is_fence: boolean;

  @Column()
  description: string;

  @Column()
  visit_price: number;

  @Column()
  water_commission: number;

  @Column({ nullable: true })
  water_drilling_rate: number;

  @Column()
  electricity_commission: number;

  @Column({ nullable: true })
  electricity_decounter_meter_rate: number;

  @Column({ default: true })
  is_active: boolean;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column({
    type: 'enum',
    enum: WaterMeterTypeEnum,
    enumName: 'water_meter_type_enum',
  })
  water_meter_type: WaterMeterTypeEnum;

  @Column({
    type: 'enum',
    enum: PaintEnum,
    enumName: 'paint_enum',
  })
  paint: PaintEnum;

  @Column({
    type: 'enum',
    enum: SanitaryEnum,
    enumName: 'sanitary_enum',
  })
  sanitary: SanitaryEnum;

  @Column({
    type: 'enum',
    enum: ElectricityMeterTypeEnum,
    enumName: 'electricity_meter_type_enum',
  })
  electricity_meter_type: ElectricityMeterTypeEnum;

  @Column({
    type: 'enum',
    enum: ElectricityPersonalMeterTypeEnum,
    enumName: 'electricity_personal_meter_type_enum',
    nullable: true,
  })
  electricity_personal_meter_type: ElectricityPersonalMeterTypeEnum;

  @OneToMany(() => Gallery, (gallery) => gallery.property, { cascade: true })
  galleries: Gallery[];

  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  user: User;
}
