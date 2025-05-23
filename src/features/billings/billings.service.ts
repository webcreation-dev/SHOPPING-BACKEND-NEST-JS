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
      console.log('🚀 [PAYDUE] Démarrage de la transaction:', {
        userId: user.id,
        userBalance: user.balance_mtn,
        payDueDto,
        timestamp: new Date().toISOString(),
      });

      // Recherche du contrat
      console.log('🔍 [PAYDUE] Recherche du contrat...');
      const contract = await manager.findOne(Contract, {
        where: {
          id: payDueDto.contract_id,
          tenant: { id: user.id },
          status: StatusContractEnum.ACTIVE,
        },
      });

      if (!contract) {
        console.log('❌ [PAYDUE] Contrat non trouvé:', {
          contractId: payDueDto.contract_id,
          userId: user.id,
        });
        throw new NotFoundException(
          `Contract with ID ${payDueDto.contract_id} not found or not active`,
        );
      }

      console.log('✅ [PAYDUE] Contrat trouvé:', {
        contractId: contract.id,
        contractStatus: contract.status,
      });

      // Recherche des échéances
      console.log('🔍 [PAYDUE] Recherche des échéances...');
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

      console.log('📋 [PAYDUE] Échéances trouvées:', {
        totalDues: dues.length,
        duesDetails: dues.map((due) => ({
          id: due.id,
          dueDate: due.due_date,
          status: due.status_due,
          amountPaid: due.amount_paid,
          carryOverAmount: due.carry_over_amount,
          hasInvoices: !!due.invoices?.items?.length,
        })),
      });

      let remainingAmount = payDueDto.amount;
      console.log('💰 [PAYDUE] Montant initial à traiter:', remainingAmount);

      // Traitement de chaque échéance
      for (let i = 0; i < dues.length; i++) {
        const due = dues[i];
        console.log(
          `\n📌 [PAYDUE] Traitement échéance ${i + 1}/${dues.length}:`,
          {
            dueId: due.id,
            dueStatus: due.status_due,
            remainingAmount,
            carryOverAmount: due.carry_over_amount,
            amountPaid: due.amount_paid,
          },
        );

        if (remainingAmount <= 0) {
          console.log(
            '⏹️ [PAYDUE] Plus de montant restant, arrêt du traitement',
          );
          break;
        }

        // Traitement du carry-over
        if (due.status_due !== StatusDueEnum.FINISHED) {
          console.log(
            '🔄 [PAYDUE] Échéance non terminée, vérification carry-over...',
          );

          if (due.carry_over_amount > 0) {
            console.log('💸 [PAYDUE] Traitement du carry-over:', {
              carryOverAmount: due.carry_over_amount,
              remainingAmount,
            });

            const carryOverPayment = Math.min(
              due.carry_over_amount,
              remainingAmount,
            );

            console.log(
              '💳 [PAYDUE] Paiement carry-over calculé:',
              carryOverPayment,
            );

            remainingAmount -= carryOverPayment;

            console.log("🏦 [PAYDUE] Création de l'annuité...");
            await this.createAnnuity(manager, due, carryOverPayment);

            const newStatus =
              due.carry_over_amount - carryOverPayment === 0
                ? StatusDueEnum.FINISHED
                : StatusDueEnum.IN_PROGRESS;

            console.log('📝 [PAYDUE] Nouveau statut calculé:', {
              oldStatus: due.status_due,
              newStatus,
              newCarryOverAmount: due.carry_over_amount - carryOverPayment,
              newAmountPaid: due.amount_paid + carryOverPayment,
            });

            await manager.update(Due, due.id, {
              amount_paid: due.amount_paid + carryOverPayment,
              carry_over_amount: due.carry_over_amount - carryOverPayment,
              status_due: newStatus,
              is_refunded: newStatus === StatusDueEnum.FINISHED,
            });

            // Mise à jour de l'objet local
            due.amount_paid += carryOverPayment;
            due.carry_over_amount -= carryOverPayment;
            due.status_due = newStatus;

            console.log('✅ [PAYDUE] Échéance mise à jour:', {
              dueId: due.id,
              newAmountPaid: due.amount_paid,
              newCarryOverAmount: due.carry_over_amount,
              newStatus: due.status_due,
              remainingAmount,
            });
          } else {
            console.log('ℹ️ [PAYDUE] Pas de carry-over à traiter');
          }
        } else {
          console.log('✅ [PAYDUE] Échéance déjà terminée');
        }

        // Traitement des factures si statut = FINISHED
        if (due.status_due === StatusDueEnum.FINISHED && remainingAmount > 0) {
          console.log(
            '🧾 [PAYDUE] Traitement des factures (échéance terminée):',
            {
              remainingAmount,
              hasInvoices: !!due.invoices?.items?.length,
            },
          );

          const amountBeforeInvoices = remainingAmount;
          remainingAmount = await this.processInvoices(
            manager,
            due,
            remainingAmount,
          );

          console.log('💰 [PAYDUE] Après traitement factures (FINISHED):', {
            amountBefore: amountBeforeInvoices,
            amountAfter: remainingAmount,
            processed: amountBeforeInvoices - remainingAmount,
          });

          // RECHARGER l'échéance après processInvoices pour avoir les statuts à jour
          const updatedDue = await manager.findOne(Due, {
            where: { id: due.id },
          });
          if (updatedDue?.invoices) {
            due.invoices = updatedDue.invoices;
            console.log(
              '🔄 [PAYDUE] Échéance rechargée après traitement factures (FINISHED)',
            );
          }
        }

        // Vérification des factures impayées
        if (remainingAmount > 0 && due.invoices?.items?.length) {
          console.log('🔍 [PAYDUE] Vérification factures impayées...');

          const hasUnpaidInvoices = due.invoices.items.some(
            (inv) => inv.status === 'PENDING' || inv.status === 'IN_PROGRESS',
          );

          console.log('📊 [PAYDUE] État des factures:', {
            totalInvoices: due.invoices.items.length,
            hasUnpaidInvoices,
            invoicesStatus: due.invoices.items.map((inv) => ({
              id: inv.id,
              status: inv.status,
              amount: inv.amount,
            })),
          });

          if (hasUnpaidInvoices) {
            console.log('💸 [PAYDUE] Traitement des factures impayées...');
            const amountBeforeInvoices = remainingAmount;

            remainingAmount = await this.processInvoices(
              manager,
              due,
              remainingAmount,
            );

            console.log('💰 [PAYDUE] Après traitement factures impayées:', {
              amountBefore: amountBeforeInvoices,
              amountAfter: remainingAmount,
              processed: amountBeforeInvoices - remainingAmount,
            });

            // RECHARGER l'échéance après processInvoices pour avoir les statuts à jour
            const updatedDue = await manager.findOne(Due, {
              where: { id: due.id },
            });
            if (updatedDue?.invoices) {
              due.invoices = updatedDue.invoices;
              console.log(
                '🔄 [PAYDUE] Échéance rechargée après traitement factures impayées',
              );
            }
          }
        }

        // Vérification si toutes les factures sont payées (APRÈS rechargement)
        if (due.invoices?.items?.length) {
          const allInvoicesPaid = due.invoices.items.every(
            (inv) => inv.status === 'PAID',
          );

          console.log(
            '🔎 [PAYDUE] Vérification statut toutes factures (après rechargement):',
            {
              totalInvoices: due.invoices.items.length,
              allInvoicesPaid,
              currentIsRefunded: due.invoices.is_refunded,
              invoicesStatus: due.invoices.items.map((inv) => ({
                id: inv.id,
                status: inv.status,
              })),
            },
          );

          if (allInvoicesPaid && !due.invoices.is_refunded) {
            console.log(
              '✅ [PAYDUE] Toutes les factures sont payées, mise à jour is_refunded',
            );

            due.invoices.is_refunded = true;
            await manager.update(Due, due.id, {
              invoices: due.invoices,
            });

            console.log(
              "💾 [PAYDUE] is_refunded mis à true pour l'échéance:",
              due.id,
            );
          } else if (allInvoicesPaid && due.invoices.is_refunded) {
            console.log(
              'ℹ️ [PAYDUE] Toutes les factures sont déjà payées et is_refunded est déjà true',
            );
          }
        }

        console.log(
          `✅ [PAYDUE] Fin traitement échéance ${i + 1}, montant restant:`,
          remainingAmount,
        );
      }

      // Traitement du montant restant (balance utilisateur)
      if (remainingAmount > 0) {
        console.log('💰 [PAYDUE] Montant restant à ajouter au solde:', {
          remainingAmount,
          currentBalance: user.balance_mtn,
          newBalance: user.balance_mtn + remainingAmount,
        });

        await manager.update(User, user.id, {
          balance_mtn: user.balance_mtn + remainingAmount,
        });

        console.log('✅ [PAYDUE] Solde utilisateur mis à jour');
      } else {
        console.log('ℹ️ [PAYDUE] Pas de montant restant à ajouter au solde');
      }

      console.log('🔍 [PAYDUE] Récupération du contrat final...');
      const finalContract = await this.contractsService.findOne(contract.id);

      console.log('🎉 [PAYDUE] Transaction terminée avec succès:', {
        contractId: contract.id,
        initialAmount: payDueDto.amount,
        finalRemainingAmount: remainingAmount,
        timestamp: new Date().toISOString(),
      });

      return finalContract;
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
