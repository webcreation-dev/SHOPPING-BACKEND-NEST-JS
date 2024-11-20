import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DEFAULT_PAGE_SIZE } from 'common/util/common.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    const order = this.ordersRepository.create(createOrderDto);
    return this.ordersRepository.save(order);
  }

  findAll(paginationDto: PaginationDto) {
    const { limit, offset } = paginationDto;

    return this.ordersRepository.find({
      skip: offset,
      take: limit ?? DEFAULT_PAGE_SIZE.ORDER,
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.preload({
      id,
      ...updateOrderDto,
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.ordersRepository.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    return this.ordersRepository.remove(order);
  }
}
