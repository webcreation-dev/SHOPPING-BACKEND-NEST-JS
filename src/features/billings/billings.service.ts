import { HttpException, Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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
import { RequestToPayDto } from 'libs/common/src/momo-mtn/dto/request-to-pay.dto';
import { v4 as uuidv4 } from 'uuid';
import { PayCallbackDto } from 'libs/common/src/momo-mtn/dto/pay-callback.dto';
import { Transaction } from './entities/transaction.entity';
import { groupBy } from 'lodash';

// Configuration externalisée
const BILLING_CONFIG = {
  MAX_UNPAID_DUES: 3,
  CRON_SCHEDULE: '0 0 1 * *',
  PAYMENT_TIMEOUT: 30000,
  EXTERNAL_ID_LENGTH: 10,
} as const;

interface PaymentResult {
  transaction: Transaction;
  contract: Contract;
  remainingAmount: number;
}

interface DueProcessingResult {
  processedAmount: number;
  remainingAmount: number;
  updatedDue: Due;
}

@Injectable()
export class BillingsService {
  private readonly logger = new Logger(BillingsService.name);

  constructor(
    private readonly annuitiesRepository: AnnuitiesRepository,
    private readonly contractsRepository: ContractsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly duesRepository: DuesRepository,
    private readonly contractsService: ContractsService,
    private readonly dataSource: DataSource,
    private readonly momoMtnService: MomoMtnService,
  ) {}

  @Cron(BILLING_CONFIG.CRON_SCHEDULE)
  async handleMonthlyDueCreation(): Promise<void> {
    this.logger.log('Début du cron pour la création des échéances');
    
    try {
      await this.createDue();
      this.logger.log('Fin du cron pour la création des échéances');
    } catch (error) {
      this.logger.error('Erreur lors de la création des échéances', error);
      throw error;
    }
  }

  async createDue(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Optimisation: récupérer tous les contrats actifs avec leurs dues en une seule requête
      const activeContracts = await this.getActiveContractsWithDues(queryRunner.manager);
      const now = new Date();

      const contractsToProcess = await this.filterContractsForDueCreation(
        activeContracts,
        now,
        queryRunner.manager
      );

      // Traitement par batch pour éviter les problèmes de mémoire
      const batchSize = 100;
      for (let i = 0; i < contractsToProcess.length; i += batchSize) {
        const batch = contractsToProcess.slice(i, i + batchSize);
        await this.processDueCreationBatch(batch, queryRunner.manager);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Erreur lors de la création des échéances', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async payDue(user: User, payDueDto: PayDueDto): Promise<any> {
    // Validation des données d'entrée
    this.validatePayDueInput(payDueDto);

    return await this.dataSource.transaction(async (manager) => {
      this.logger.log(`Démarrage du paiement pour l'utilisateur ${user.id}`, {
        userId: user.id,
        amount: payDueDto.amount,
        contractId: payDueDto.contract_id,
      });

      // Étape 1: Initier le paiement
      const paymentResponse = await this.initiatePayment({
        amount: payDueDto.amount.toString(),
        msisdn: payDueDto.msisdn.toString(),
      });

      // Étape 2: Créer la transaction
      const transaction = await this.createTransaction(
        manager,
        user,
        payDueDto,
        paymentResponse,
      );

      // Étape 3: Valider et récupérer le contrat
      const contract = await this.validateAndGetContract(manager, user, payDueDto);

      // Étape 4: Traiter le paiement des échéances
      const paymentResult = await this.processPayment(
        manager,
        contract,
        payDueDto.amount,
        user
      );

      this.logger.log('Paiement traité avec succès', {
        contractId: contract.id,
        processedAmount: payDueDto.amount - paymentResult.remainingAmount,
        remainingAmount: paymentResult.remainingAmount,
      });

      return await this.contractsService.findOne(contract.id);
    });
  }

  async payCallback(payCallback: PayCallbackDto): Promise<any> {
    try {
      return await this.momoMtnService.payStatus(payCallback);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du paiement', error);
      throw new HttpException(
        error.response?.data || 'Erreur lors de la récupération du paiement',
        error.response?.status || 500,
      );
    }
  }

  // Méthodes privées optimisées et refactorisées

  private validatePayDueInput(payDueDto: PayDueDto): void {
    if (!payDueDto.amount || payDueDto.amount <= 0) {
      throw new BadRequestException('Le montant doit être positif');
    }

    if (!payDueDto.msisdn || !this.isValidMsisdn(payDueDto.msisdn.toString())) {
      throw new BadRequestException('Numéro MSISDN invalide');
    }

    if (!payDueDto.contract_id) {
      throw new BadRequestException('ID de contrat requis');
    }
  }

  private isValidMsisdn(msisdn: string): boolean {
    // Validation basique du MSISDN (à adapter selon vos besoins)
    const msisdnRegex = /^\d{8,15}$/;
    return msisdnRegex.test(msisdn.toString());
  }

  private async getActiveContractsWithDues(manager: EntityManager): Promise<Contract[]> {
    return await manager
      .createQueryBuilder(Contract, 'contract')
      .leftJoinAndSelect('contract.dues', 'due')
      .where('contract.status = :status', { status: StatusContractEnum.ACTIVE })
      .getMany();
  }

  private async filterContractsForDueCreation(
    contracts: Contract[],
    now: Date,
    manager: EntityManager
  ): Promise<Contract[]> {
    const contractsToProcess: Contract[] = [];

    for (const contract of contracts) {
      const nonFinishedDues = contract.dues?.filter(
        (due) => due.status_due !== StatusDueEnum.FINISHED,
      ) || [];

      // Suspendre les contrats avec trop d'échéances impayées
      if (nonFinishedDues.length > BILLING_CONFIG.MAX_UNPAID_DUES) {
        await manager.update(Contract, contract.id, {
          status: StatusContractEnum.SUSPENDED,
        });
        this.logger.warn(`Contrat ${contract.id} suspendu - trop d'échéances impayées`);
        continue;
      }

      // Vérifier si une nouvelle échéance doit être créée
      if (await this.shouldCreateNewDue(contract, now)) {
        contractsToProcess.push(contract);
      }
    }

    return contractsToProcess;
  }

  private async shouldCreateNewDue(contract: Contract, now: Date): Promise<boolean> {
    if (!contract.dues || contract.dues.length === 0) {
      return true;
    }

    const lastDue = contract.dues.reduce((latest, due) => 
      due.due_date > latest.due_date ? due : latest
    );

    return (
      lastDue.due_date.getMonth() !== now.getMonth() ||
      lastDue.due_date.getFullYear() !== now.getFullYear()
    );
  }

  private async processDueCreationBatch(
    contracts: Contract[],
    manager: EntityManager
  ): Promise<void> {
    const duesToCreate = contracts.map(contract => 
      new Due({
        contract,
        carry_over_amount: contract.rent_price,
      })
    );

    await manager.save(Due, duesToCreate);
  }

  private async validateAndGetContract(
    manager: EntityManager,
    user: User,
    payDueDto: PayDueDto
  ): Promise<Contract> {
    const contract = await manager.findOne(Contract, {
      where: {
        id: payDueDto.contract_id,
        tenant: { id: user.id },
        status: StatusContractEnum.ACTIVE,
      },
    });

    if (!contract) {
      throw new NotFoundException(
        `Contrat avec ID ${payDueDto.contract_id} non trouvé ou inactif`,
      );
    }

    return contract;
  }

  private async processPayment(
    manager: EntityManager,
    contract: Contract,
    amount: number,
    user: User
  ): Promise<PaymentResult> {
    // Récupérer toutes les échéances à traiter
    const dues = await this.getDuesToProcess(manager, contract);
    
    let remainingAmount = amount;
    this.logger.log(`Traitement de ${dues.length} échéances avec un montant de ${amount}`);

    // Traiter chaque échéance
    for (const due of dues) {
      if (remainingAmount <= 0) break;

      const result = await this.processSingleDue(manager, due, remainingAmount);
      remainingAmount = result.remainingAmount;

      this.logger.debug(`Échéance ${due.id} traitée`, {
        processedAmount: result.processedAmount,
        remainingAmount: result.remainingAmount,
      });
    }

    // Mettre à jour le solde utilisateur si nécessaire
    if (remainingAmount > 0) {
      await this.updateUserBalance(manager, user, remainingAmount);
    }

    return {
      transaction: null, // À implémenter selon vos besoins
      contract,
      remainingAmount,
    };
  }

  private async getDuesToProcess(
    manager: EntityManager,
    contract: Contract
  ): Promise<Due[]> {
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

    return dues;
  }

  private async processSingleDue(
    manager: EntityManager,
    due: Due,
    availableAmount: number
  ): Promise<DueProcessingResult> {
    let processedAmount = 0;
    let remainingAmount = availableAmount;

    // Traitement du carry-over
    if (due.status_due !== StatusDueEnum.FINISHED && due.carry_over_amount > 0) {
      const carryOverResult = await this.processCarryOver(manager, due, remainingAmount);
      processedAmount += carryOverResult.processedAmount;
      remainingAmount = carryOverResult.remainingAmount;
    }

    // Traitement des factures
    if (remainingAmount > 0 && due.invoices?.items?.length) {
      const invoiceResult = await this.processInvoices(manager, due, remainingAmount);
      processedAmount += (remainingAmount - invoiceResult);
      remainingAmount = invoiceResult;
    }

    return {
      processedAmount,
      remainingAmount,
      updatedDue: due,
    };
  }

  private async processCarryOver(
    manager: EntityManager,
    due: Due,
    availableAmount: number
  ): Promise<{ processedAmount: number; remainingAmount: number }> {
    const carryOverPayment = Math.min(due.carry_over_amount, availableAmount);
    
    if (carryOverPayment <= 0) {
      return { processedAmount: 0, remainingAmount: availableAmount };
    }

    // Créer l'annuité
    await this.createAnnuity(manager, due, carryOverPayment);

    // Calculer le nouveau statut
    const newCarryOverAmount = due.carry_over_amount - carryOverPayment;
    const newAmountPaid = due.amount_paid + carryOverPayment;
    const newStatus = newCarryOverAmount === 0 ? StatusDueEnum.FINISHED : StatusDueEnum.IN_PROGRESS;

    // Mettre à jour l'échéance
    await manager.update(Due, due.id, {
      amount_paid: newAmountPaid,
      carry_over_amount: newCarryOverAmount,
      status_due: newStatus,
      is_refunded: newStatus === StatusDueEnum.FINISHED,
    });

    // Mettre à jour l'objet local
    due.amount_paid = newAmountPaid;
    due.carry_over_amount = newCarryOverAmount;
    due.status_due = newStatus;

    return {
      processedAmount: carryOverPayment,
      remainingAmount: availableAmount - carryOverPayment,
    };
  }

  private async processInvoices(
    manager: EntityManager,
    due: Due,
    remainingAmount: number,
  ): Promise<number> {
    if (!due.invoices || due.invoices.items.length === 0) {
      return remainingAmount;
    }

    const initialAmount = remainingAmount;
    const updatedInvoices = [...due.invoices.items];

    // Traiter chaque facture
    for (let i = 0; i < updatedInvoices.length; i++) {
      const invoice = updatedInvoices[i];
      
      if (remainingAmount <= 0 || !this.isInvoicePayable(invoice)) {
        continue;
      }

      const invoicePayment = Math.min(invoice.carry_over_amount, remainingAmount);
      remainingAmount -= invoicePayment;

      updatedInvoices[i] = {
        ...invoice,
        carry_over_amount: invoice.carry_over_amount - invoicePayment,
        status: invoice.carry_over_amount - invoicePayment === 0 ? 'PAID' : 'IN_PROGRESS',
      };
    }

    // Mettre à jour les factures
    await manager.update(Due, due.id, {
      invoices: {
        ...due.invoices,
        items: updatedInvoices,
      },
    });

    // Créer l'annuité pour le montant traité
    const processedAmount = initialAmount - remainingAmount;
    if (processedAmount > 0) {
      await this.createAnnuity(manager, due, processedAmount);
    }

    // Vérifier si toutes les factures sont payées
    await this.checkAndUpdateInvoicesStatus(manager, due, updatedInvoices);

    return remainingAmount;
  }

  private isInvoicePayable(invoice: any): boolean {
    return invoice.status === 'PENDING' || invoice.status === 'IN_PROGRESS';
  }

  private async checkAndUpdateInvoicesStatus(
    manager: EntityManager,
    due: Due,
    invoices: any[]
  ): Promise<void> {
    const allInvoicesPaid = invoices.every(inv => inv.status === 'PAID');
    
    if (allInvoicesPaid && due.invoices && !due.invoices.is_refunded) {
      await manager.update(Due, due.id, {
        invoices: {
          ...due.invoices,
          is_refunded: true,
        },
      });
    }
  }

  private async updateUserBalance(
    manager: EntityManager,
    user: User,
    amount: number
  ): Promise<void> {
    if (amount <= 0) return;

    await manager.update(User, user.id, {
      balance_mtn: user.balance_mtn + amount,
    });

    this.logger.log(`Solde utilisateur ${user.id} mis à jour`, {
      addedAmount: amount,
      newBalance: user.balance_mtn + amount,
    });
  }

  private async createTransaction(
    manager: EntityManager,
    user: User,
    payDueDto: PayDueDto,
    paymentResponse: any,
  ): Promise<Transaction> {
    const contract = await manager.findOne(Contract, {
      where: { id: payDueDto.contract_id },
    });

    const transaction = new Transaction({
      amount: payDueDto.amount,
      payment_type: payDueDto.payment_type,
      user: user,
      contract: contract,
      meta: {
        payment_response: paymentResponse,
      },
      payment_method: payDueDto.payment_method,
      payment_status: paymentResponse.status,
    });

    return await manager.save(Transaction, transaction);
  }

  private async createAnnuity(
    manager: EntityManager,
    due: Due,
    amount: number,
  ): Promise<Annuity> {
    if (amount <= 0) {
      throw new BadRequestException('Le montant de l\'annuité doit être positif');
    }

    const annuity = new Annuity({ due, amount });
    return manager.save(Annuity, annuity);
  }

  async initiatePayment({
    amount,
    msisdn,
  }: {
    amount: string;
    msisdn: string;
  }): Promise<any> {
    try {
      const externalId = this.generateExternalId();
      const apiToken = await this.getApiToken();

      const requestToPayDto: RequestToPayDto = {
        x_reference_id: uuidv4(),
        amount,
        currency: 'XOF',
        externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: msisdn,
        },
        payerMessage: 'LOCAPAY MOMO MARCHAND',
        payeeNote: 'Paiement de loyer',
        api_token: apiToken,
      };

      await this.momoMtnService.requestToPay(requestToPayDto);
      
      const response = await this.momoMtnService.payStatus({
        api_token: apiToken,
        request_id_debit: requestToPayDto.x_reference_id,
      });

      return response;
    } catch (error) {
      this.logger.error('Erreur lors de l\'initiation du paiement', error);
      throw new HttpException(
        error.response?.data || "Erreur lors de l'initiation du paiement",
        error.response?.status || 500,
      );
    }
  }

  private generateExternalId(): string {
    return Math.random()
      .toString(36)
      .substring(2, 2 + BILLING_CONFIG.EXTERNAL_ID_LENGTH);
  }

  private async getApiToken(): Promise<string> {
    try {
      const response = await this.momoMtnService.createApiToken();
      return response.access_token;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du token API', error);
      throw new HttpException('Impossible de récupérer le token API', 500);
    }
  }
}