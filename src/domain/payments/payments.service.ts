import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'orders/entities/order.entity';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { OrderStatus } from 'orders/enums/order-status.enum';
import { RequestUser } from 'auth/interfaces/request-user.interface';
import { compareUserId } from 'auth/util/authentication.util';
import { Role } from 'auth/roles/enums/role.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async payOrder(id: number, currentUser: RequestUser) {
    const order = await this.ordersRepository.findOneOrFail({
      where: { id },
      relations: {
        payment: true,
        customer: true,
      },
    });
    if (currentUser.role !== Role.ADMIN) {
      compareUserId(currentUser.id, order.customer.id);
    }
    if (order.payment) {
      throw new ConflictException('Order already paid');
    }

    const payment = this.paymentsRepository.create();
    order.payment = payment;
    order.status = OrderStatus.AWAITING_SHIPMENT;
    return this.ordersRepository.save(order);
  }
}
