import { Injectable } from '@nestjs/common';
import { ContractsService } from '../contracts/contracts.service';
import { DuesRepository } from '../contracts/repositories/dues.repository';
import { Due } from '../contracts/entities/due.entity';
import { PayDueDto } from './dto/pay-due.dto';
import { StatusContractEnum } from '../contracts/enums/status-contract.enum';
import { ContractsRepository } from '../contracts/repositories/contracts.repository';
import { User } from '../auth/users/entities/user.entity';
import { StatusDueEnum } from '../contracts/enums/status-due.enum';
import { Annuity } from '../contracts/entities/annuity.entity';
import { AnnuitiesRepository } from '../contracts/repositories/annuities.repository';

@Injectable()
export class BillingsService {
  constructor(
    private readonly annuitiesRepository: AnnuitiesRepository,
    private readonly contractsRepository: ContractsRepository,
    private readonly duesRepository: DuesRepository,
    private readonly contractsService: ContractsService,
  ) {}

  async createDue() {
    const contracts = await this.contractsService.getAll();
    const now = new Date();

    for (const contract of contracts) {
      const [lastDue] = await this.duesRepository.findAndCount(
        { contract: { id: contract.id } },
        {
          order: { due_date: 'DESC' },
          take: 1,
        },
      );
      if (lastDue) {
        const dueDate = lastDue[0].due_date;

        if (
          dueDate.getMonth() != now.getMonth() &&
          dueDate.getFullYear() != now.getFullYear()
        ) {
          this.duesRepository.create(
            new Due({
              contract,
            }),
          );
        }
      }
    }
  }

  async payDue(id: number, user: User, payDueDto: PayDueDto) {
    const contract = await this.contractsRepository.findOne({
      id,
      tenant: { id: user.id },
      status: StatusContractEnum.ACTIVE,
    });


    const [dues] = await this.duesRepository.findAndCount(
      {
        contract: { id: contract.id },
        status_due: StatusDueEnum.WAITING || StatusDueEnum.IN_PROGRESS,
      },
      {
        order: { due_date: 'ASC' },
      },
    );

    console.log('dues', dues);

    let remainingAmount = payDueDto.amount;

    for (const due of dues) {
      // payment for due in progress
      if (
        due.carry_over_amount > 0 &&
        due.status_due === StatusDueEnum.IN_PROGRESS
      ) {
        const carryOverPayment = Math.min(
          due.carry_over_amount,
          remainingAmount,
        );
        remainingAmount -= carryOverPayment;
        await this.createAnnuity(due, carryOverPayment);

        await this.duesRepository.findOneAndUpdate(
          { id: due.id },
          {
            amount_paid: due.amount_paid + carryOverPayment,
            carry_over_amount: due.carry_over_amount - carryOverPayment,
            status_due:
              due.carry_over_amount - carryOverPayment === 0
                ? StatusDueEnum.FINISHED
                : StatusDueEnum.IN_PROGRESS,
          },
        );
      }

      // payment for due waiting
      if (due.status_due === StatusDueEnum.WAITING) {
        const carryOverPayment = Math.min(
          due.carry_over_amount,
          remainingAmount,
        );
        remainingAmount -= carryOverPayment;
        await this.createAnnuity(due, carryOverPayment);

        await this.duesRepository.findOneAndUpdate(
          { id: due.id },
          {
            amount_paid: due.amount_paid + carryOverPayment,
            carry_over_amount: due.carry_over_amount - carryOverPayment,
            status_due:
              due.carry_over_amount - carryOverPayment === 0
                ? StatusDueEnum.FINISHED
                : StatusDueEnum.IN_PROGRESS,
          },
        );
      }
    }

    return contract;
  }

  async createAnnuity(due: Due, amount: number): Promise<Annuity> {
    return this.annuitiesRepository.create(
      new Annuity({
        due,
        amount,
      }),
    );
  }
}
