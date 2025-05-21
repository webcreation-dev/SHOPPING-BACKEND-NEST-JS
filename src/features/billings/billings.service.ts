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
import { In } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { UsersRepository } from '../auth/users/users.repository';

@Injectable()
export class BillingsService {
  constructor(
    private readonly annuitiesRepository: AnnuitiesRepository,
    private readonly contractsRepository: ContractsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly duesRepository: DuesRepository,
    private readonly contractsService: ContractsService,
  ) {}

  @Cron('0 0 1 * *') // Minute 0, Heure 0, Jour 1, Tous les mois
  async handleMonthlyDueCreation() {
    console.log('Début du cron pour la création des échéances');
    await this.createDue();
    console.log('Fin du cron pour la création des échéances');
  }

  async createDue() {
    const contracts = await this.contractsService.getAll();
    const now = new Date();

    for (const contract of contracts) {
      if (contract.status === StatusContractEnum.ACTIVE) {
        // Récupère toutes les dues liées au contrat
        const dues = await this.duesRepository.find({
          contract: { id: contract.id },
        });

        // Compte le nombre de dues non FINISHED
        const nonFinishedDues = dues.filter(
          (due) => due.status_due !== StatusDueEnum.FINISHED,
        );

        // Si plus de 3 dues ne sont pas FINISHED, suspendre le contrat
        if (nonFinishedDues.length > 3) {
          await this.contractsRepository.findOneAndUpdate(
            { id: contract.id },
            { status: StatusContractEnum.SUSPENDED },
          );
          continue; // on ne génère pas de nouvelle échéance si le contrat est suspendu
        }

        // Sinon, on regarde s'il faut créer une nouvelle échéance
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
            await this.duesRepository.create(
              new Due({
                contract,
                carry_over_amount: contract.rent_price,
              }),
            );
          }
        }
      }
    }
  }

  async payDue(user: User, payDueDto: PayDueDto) {
    console.log('Démarrage payDue:', { userId: user.id, payDueDto });

    const contract = await this.contractsRepository.findOne({
      id: payDueDto.contract_id,
      tenant: { id: user.id },
      status: StatusContractEnum.ACTIVE,
    });

    if (!contract) {
      console.log(
        `Contrat non trouvé avec ID: ${payDueDto.contract_id}, userID: ${user.id}`,
      );
      throw new NotFoundException(
        `Contract with ID ${payDueDto.contract_id} not found or not active`,
      );
    }
    console.log('Contrat trouvé:', { contractId: contract.id });

    const [dues] = await this.duesRepository.findAndCount(
      {
        contract: { id: contract.id },
        status_due: In([
          StatusDueEnum.WAITING,
          StatusDueEnum.IN_PROGRESS,
          StatusDueEnum.FINISHED,
        ]),
      },
      {
        order: { due_date: 'ASC' },
      },
    );
    console.log(`Échéances trouvées: ${dues?.length || 0}`);

    let remainingAmount = payDueDto.amount;
    console.log(`Montant initial à payer: ${remainingAmount}`);

    for (const due of dues) {
      console.log('---------------------------------------');
      console.log(`Traitement de l'échéance ID: ${due.id}`);
      console.log(
        `Statut actuel: ${due.status_due}, Montant dû: ${due.carry_over_amount}, Montant payé: ${due.amount_paid}`,
      );
      console.log(`Montant restant à allouer: ${remainingAmount}`);

      // Si aucun montant restant à payer, sortir de la boucle
      if (remainingAmount <= 0) {
        console.log('Plus de montant restant, fin du traitement des échéances');
        break;
      }

      // 1. Paiement du montant principal pour les échéances non entièrement payées
      if (due.status_due !== StatusDueEnum.FINISHED) {
        console.log(
          `Traitement du montant principal pour l'échéance ${due.id}`,
        );

        if (due.carry_over_amount > 0) {
          const carryOverPayment = Math.min(
            due.carry_over_amount,
            remainingAmount,
          );
          console.log(`Paiement alloué à cette échéance: ${carryOverPayment}`);

          remainingAmount -= carryOverPayment;
          console.log(`Nouveau montant restant: ${remainingAmount}`);

          await this.createAnnuity(due, carryOverPayment);
          console.log('Annuité créée');

          const newStatus =
            due.carry_over_amount - carryOverPayment === 0
              ? StatusDueEnum.FINISHED
              : StatusDueEnum.IN_PROGRESS;
          console.log(`Mise à jour statut échéance: ${newStatus}`);

          await this.duesRepository.findOneAndUpdate(
            { id: due.id },
            {
              amount_paid: due.amount_paid + carryOverPayment,
              carry_over_amount: due.carry_over_amount - carryOverPayment,
              status_due: newStatus,
            },
          );
          console.log(
            `Échéance mise à jour avec nouveau montant payé: ${due.amount_paid + carryOverPayment}`,
          );

          // Mise à jour de l'objet due pour refléter les changements
          due.amount_paid += carryOverPayment;
          due.carry_over_amount -= carryOverPayment;
          due.status_due = newStatus;
        } else {
          console.log('Montant principal déjà à 0, aucun paiement nécessaire');
        }
      } else {
        console.log(
          'Échéance déjà marquée comme FINISHED, traitement uniquement des factures',
        );
      }

      // 2. Traitement des factures si l'échéance est entièrement payée ou le montant principal est à 0
      if (due.status_due === StatusDueEnum.FINISHED && remainingAmount > 0) {
        console.log(
          `Traitement des factures pour l'échéance ${due.id} (statut FINISHED)`,
        );
        const beforeInvoices = remainingAmount;
        remainingAmount = await this.processInvoices(due, remainingAmount);
        console.log(
          `Montant utilisé pour les factures: ${beforeInvoices - remainingAmount}`,
        );
        console.log(
          `Montant restant après traitement des factures: ${remainingAmount}`,
        );
      }

      // Si toujours de l'argent disponible mais l'échéance et ses factures non complètement payées, ne pas passer à la suivante
      if (remainingAmount > 0) {
        // Vérifions si cette échéance a des factures non payées
        const hasUnpaidInvoices =
          due.invoices &&
          due.invoices.some(
            (inv) => inv.status === 'PENDING' || inv.status === 'IN_PROGRESS',
          );

        if (hasUnpaidInvoices) {
          console.log(
            `L'échéance ${due.id} a encore des factures impayées. Refaire un cycle de paiement.`,
          );
          // On doit refaire un cycle de paiement pour cette même échéance
          // Récupérer l'échéance mise à jour
          const updatedDue = await this.duesRepository.findOne({ id: due.id });
          if (updatedDue) {
            // On décrémente l'index pour rester sur cette échéance
            remainingAmount = await this.processInvoices(
              updatedDue,
              remainingAmount,
            );
            console.log(
              `Montant restant après nouveau traitement des factures: ${remainingAmount}`,
            );
          }
        } else {
          console.log(
            `L'échéance ${due.id} est entièrement payée (montant principal et factures)`,
          );
        }
      }
    }

    console.log('---------------------------------------');
    console.log(
      `Fin du processus de paiement, montant non utilisé: ${remainingAmount}`,
    );

    if (remainingAmount > 0) {
      await this.usersRepository.findOneAndUpdate(
        { id: user.id },
        {
          balance_mtn: user.balance_mtn + remainingAmount,
        },
      );
    }

    return await this.contractsService.findOne(contract.id);
  }

  // Méthode pour traiter les factures d'une échéance
  private async processInvoices(
    due: Due,
    remainingAmount: number,
  ): Promise<number> {
    const amountToaid = remainingAmount;
    console.log('Début du traitement des factures');

    if (!due.invoices || due.invoices.length === 0) {
      console.log('Aucune facture trouvée pour cette échéance');
      return remainingAmount;
    }

    console.log(`Nombre de factures à traiter: ${due.invoices.length}`);

    // Créer une copie mise à jour des factures
    const updatedInvoices = [...due.invoices];
    let invoicesPaid = 0;

    // Traiter chaque facture jusqu'à épuisement du montant ou toutes les factures payées
    for (let i = 0; i < updatedInvoices.length; i++) {
      if (remainingAmount <= 0) {
        console.log(
          'Plus de montant restant, arrêt du traitement des factures',
        );
        break;
      }

      const invoice = updatedInvoices[i];
      console.log(
        `Traitement facture ${i + 1}/${updatedInvoices.length} (ID: ${invoice.id})`,
      );
      console.log(
        `Statut: ${invoice.status}, Montant dû: ${invoice.carry_over_amount}`,
      );

      if (invoice.status === 'PENDING' || invoice.status === 'IN_PROGRESS') {
        const invoicePayment = Math.min(
          invoice.carry_over_amount,
          remainingAmount,
        );
        console.log(`Paiement alloué à cette facture: ${invoicePayment}`);

        remainingAmount -= invoicePayment;
        console.log(`Montant restant après paiement: ${remainingAmount}`);

        const newStatus =
          invoice.carry_over_amount - invoicePayment === 0
            ? 'PAID'
            : 'IN_PROGRESS';

        // Mettre à jour la facture dans le tableau
        updatedInvoices[i] = {
          ...invoice,
          carry_over_amount: invoice.carry_over_amount - invoicePayment,
          status: newStatus,
        };

        if (newStatus === 'PAID') {
          invoicesPaid++;
        }

        console.log(
          `Facture mise à jour - Nouveau statut: ${newStatus}, Nouveau montant restant: ${updatedInvoices[i].carry_over_amount}`,
        );
      } else {
        console.log(`Facture ignorée car déjà payée ou statut non valide`);
        if (invoice.status === 'PAID') {
          invoicesPaid++;
        }
      }
    }

    // Mettre à jour l'échéance avec les factures mises à jour
    console.log(
      `Mise à jour de l'échéance ID ${due.id} avec ${updatedInvoices.length} factures mises à jour`,
    );
    console.log(
      `${invoicesPaid}/${updatedInvoices.length} factures sont payées`,
    );

    await this.duesRepository.findOneAndUpdate(
      { id: due.id },
      { invoices: updatedInvoices },
    );
    console.log("Création d'une nouvelle annuité pour l'échéance", {
      dueId: due.id,
      amountToaid,
    });
    await this.createAnnuity(due, amountToaid - remainingAmount);
    console.log('Échéance mise à jour avec succès');

    return remainingAmount;
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
