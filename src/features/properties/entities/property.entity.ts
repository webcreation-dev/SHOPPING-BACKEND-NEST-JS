import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'libs/common/src/database/abstract.entity';
import { Gallery } from './gallery.entity';
import { WaterMeterTypeEnum } from '../enums/water_meter_type.enum';
import { PaintEnum } from '../enums/paint.enum';
import { SanitaryEnum } from '../enums/sanitary.enum';
import { ElectricityMeterTypeEnum } from '../enums/electricity_meter_type.enum';
import { ElectricityPersonalMeterTypeEnum } from '../enums/electricity_personal_meter_type.enum';
import { User } from 'src/features/auth/users/entities/user.entity';
import { Visit } from 'src/features/visits/entities/visit.entity';
import { Contract } from 'src/features/contracts/entities/contract.entity';
import { TarificationEnum } from '../enums/tarification.enum';
import { TypePropertyEnum } from '../enums/type_property.enum';
import { Panorama } from './panorama.entity';

@Entity()
export class Property extends AbstractEntity<Property> {
  @Column()
  to_sell: boolean;

  @Column({ nullable: true })
  video_url: string;

  @Column({
    type: 'enum',
    enum: TarificationEnum,
    enumName: 'tarification_enum',
    nullable: true,
  })
  tarification: TarificationEnum;

  @Column({
    type: 'enum',
    enum: TypePropertyEnum,
    enumName: 'type_property_enum',
  })
  type: TypePropertyEnum;

  @Column()
  visit_price: number;

  @Column()
  rent_price: number;

  @Column()
  commission: number;

  @Column({ nullable: true })
  management_fee: number;

  @Column()
  house_name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  municipality: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  number_households: number;

  @Column({ nullable: true })
  number_living_rooms: number;

  @Column({ nullable: true })
  number_rooms: number;

  @Column({ nullable: true })
  number_bathrooms: number;

  @Column({
    type: 'enum',
    enum: PaintEnum,
    enumName: 'paint_enum',
    nullable: true,
  })
  paint: PaintEnum;

  @Column({ nullable: true })
  is_fence: boolean;

  @Column({ nullable: true })
  is_terace: boolean;

  @Column({
    type: 'enum',
    enum: WaterMeterTypeEnum,
    enumName: 'water_meter_type_enum',
    nullable: true,
  })
  water_meter_type: WaterMeterTypeEnum;

  @Column({
    type: 'enum',
    enum: SanitaryEnum,
    enumName: 'sanitary_enum',
    nullable: true,
  })
  sanitary: SanitaryEnum;

  @Column({
    type: 'enum',
    enum: ElectricityMeterTypeEnum,
    enumName: 'electricity_meter_type_enum',
    nullable: true,
  })
  electricity_meter_type: ElectricityMeterTypeEnum;

  @Column({
    type: 'enum',
    enum: ElectricityPersonalMeterTypeEnum,
    enumName: 'electricity_personal_meter_type_enum',
    nullable: true,
  })
  electricity_personal_meter_type: ElectricityPersonalMeterTypeEnum;

  @Column({ nullable: true })
  electricity_decounter_meter_rate: number;

  @Column({ nullable: true })
  month_advance: number;

  @Column({ nullable: true })
  caution: number;

  @Column({ nullable: true })
  water_drilling_rate: number;

  @Column({ nullable: true })
  is_prepaid: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'json', default: [] })
  articles: {
    id: number;
    title: string;
    content: string;
  }[];

  @OneToMany(() => Gallery, (gallery) => gallery.property, { cascade: true })
  galleries: Gallery[];

  @OneToMany(() => Panorama, (panorama) => panorama.property, {
    cascade: true,
  })
  panorama: Panorama[];

  @OneToMany(() => Visit, (visit) => visit.property)
  visits: Visit[];

  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, (owner) => owner.ownProperties, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  owner: User;

  @OneToMany(() => Contract, (contract) => contract.property)
  contracts: Contract[];
}
