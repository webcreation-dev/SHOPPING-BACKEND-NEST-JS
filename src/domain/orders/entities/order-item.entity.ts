import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'products/entities/product.entity';
import { Expose } from 'class-transformer';

@Entity()
export class OrderItem {
  @PrimaryColumn()
  orderId: number;

  @PrimaryColumn()
  productId: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  price: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.items)
  product: Product;

  @Expose()
  get subTotal() {
    return this.quantity * this.price;
  }
}
