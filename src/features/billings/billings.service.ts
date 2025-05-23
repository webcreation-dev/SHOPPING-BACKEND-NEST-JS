import { Injectable, NotFoundException } from '@nestjs/common';
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
import { DataSource, EntityManager, In } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { UsersRepository } from '../auth/users/users.repository';
import { MomoMtnService } from 'libs/common/src/momo-mtn/momo-mtn.service';
import { Contract } from '../contracts/entities/contract.entity';

@Injectable()
export class BillingsService {
  constructor(
    private readonly annuitiesRepository: AnnuitiesRepository,
    private readonly contractsRepository: ContractsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly duesRepository: DuesRepository,
    private readonly contractsService: ContractsService,
    private readonly dataSource: DataSource,
    private readonly momoMtnService: MomoMtnService,
  ) {}

  @Cron('0 0 1 * *') // Minute 0, Heure 0, Jour 1, Tous les mois
  async handleMonthlyDueCreation() {
    console.log('Début du cron pour la création des échéances');
    await this.createDue();
    console.log('Fin du cron pour la création des échéances');
  }
  async createDue() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contracts = await this.contractsService.getAll();
      const now = new Date();

      for (const contract of contracts) {
        if (contract.status === StatusContractEnum.ACTIVE) {
          const dues = await this.duesRepository.find({
            contract: { id: contract.id },
          });

          const nonFinishedDues = dues.filter(
            (due) => due.status_due !== StatusDueEnum.FINISHED,
          );

          if (nonFinishedDues.length > 3) {
            await queryRunner.manager.update(
              'Contract',
              { id: contract.id },
              { status: StatusContractEnum.SUSPENDED },
            );
            continue;
          }

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
              dueDate.getMonth() !== now.getMonth() ||
              dueDate.getFullYear() !== now.getFullYear()
            ) {
              await queryRunner.manager.save(
                new Due({
                  contract,
                  carry_over_amount: contract.rent_price,
                }),
              );
            }
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async payDue(user: User, payDueDto: PayDueDto) {
    return await this.dataSource.transaction(async (manager) => {
      console.log('Démarrage payDue:', { userId: user.id, payDueDto });

      const contract = await manager.findOne(Contract, {
        where: {
          id: payDueDto.contract_id,
          tenant: { id: user.id },
          status: StatusContractEnum.ACTIVE,
        },
      });

      if (!contract) {
        throw new NotFoundException(
          `Contract with ID ${payDueDto.contract_id} not found or not active`,
        );
      }

      const [dues] = await manager.findAndCount(Due, {
        where: {
          contract: { id: contract.id },
          status_due: In([
            StatusDueEnum.WAITING,
            StatusDueEnum.IN_PROGRESS,
            StatusDueEnum.FINISHED,
          ]),
        },
        order: { due_date: 'ASC' },
      });

      let remainingAmount = payDueDto.amount;

      for (const due of dues) {
        if (remainingAmount <= 0) break;

        if (due.status_due !== StatusDueEnum.FINISHED) {
          if (due.carry_over_amount > 0) {
            const carryOverPayment = Math.min(
              due.carry_over_amount,
              remainingAmount,
            );

            remainingAmount -= carryOverPayment;

            await this.createAnnuity(manager, due, carryOverPayment);

            const newStatus =
              due.carry_over_amount - carryOverPayment === 0
                ? StatusDueEnum.FINISHED
                : StatusDueEnum.IN_PROGRESS;

            await manager.update(Due, due.id, {
              amount_paid: due.amount_paid + carryOverPayment,
              carry_over_amount: due.carry_over_amount - carryOverPayment,
              status_due: newStatus,
            });

            due.amount_paid += carryOverPayment;
            due.carry_over_amount -= carryOverPayment;
            due.status_due = newStatus;
          }
        }

        // Traitement des factures si statut = FINISHED
        if (due.status_due === StatusDueEnum.FINISHED && remainingAmount > 0) {
          remainingAmount = await this.processInvoices(
            manager,
            due,
            remainingAmount,
          );
        }

        // Vérifie si des factures sont toujours impayées
        if (remainingAmount > 0 && due.invoices?.items?.length) {
          const hasUnpaidInvoices = due.invoices.items.some(
            (inv) => inv.status === 'PENDING' || inv.status === 'IN_PROGRESS',
          );

          if (hasUnpaidInvoices) {
            remainingAmount = await this.processInvoices(
              manager,
              due,
              remainingAmount,
            );
          }
        }
      }

      if (remainingAmount > 0) {
        await manager.update(User, user.id, {
          balance_mtn: user.balance_mtn + remainingAmount,
        });
      }

      return await this.contractsService.findOne(contract.id);
    });
  }

  private async processInvoices(
    manager: EntityManager,
    due: Due,
    remainingAmount: number,
  ): Promise<number> {
    if (!due.invoices || due.invoices.items.length === 0) {
      return remainingAmount;
    }
    const amountToaid = remainingAmount;

    const updatedInvoices = [...due.invoices.items];

    for (let i = 0; i < updatedInvoices.length; i++) {
      const invoice = updatedInvoices[i];
      if (
        remainingAmount <= 0 ||
        (invoice.status !== 'PENDING' && invoice.status !== 'IN_PROGRESS')
      )
        continue;

      const invoicePayment = Math.min(
        invoice.carry_over_amount,
        remainingAmount,
      );
      remainingAmount -= invoicePayment;

      const newStatus =
        invoice.carry_over_amount - invoicePayment === 0
          ? 'PAID'
          : 'IN_PROGRESS';

      updatedInvoices[i] = {
        ...invoice,
        carry_over_amount: invoice.carry_over_amount - invoicePayment,
        status: newStatus,
      };
    }

    await manager.update(Due, due.id, {
      invoices: {
        ...due.invoices,
        items: updatedInvoices,
      },
    });

    await this.createAnnuity(manager, due, amountToaid - remainingAmount);

    return remainingAmount;
  }

  private async createAnnuity(
    manager: EntityManager,
    due: Due,
    amount: number,
  ): Promise<Annuity> {
    const annuity = new Annuity({ due, amount });
    return manager.save(Annuity, annuity);
  }
}
