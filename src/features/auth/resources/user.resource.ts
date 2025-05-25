import { StatusDueEnum } from 'src/features/contracts/enums/status-due.enum';
import { User } from '../users/entities/user.entity';
import { StatusContractEnum } from 'src/features/contracts/enums/status-contract.enum';
import { Contract } from 'src/features/contracts/entities/contract.entity';

export class UserResource {
  constructor() {}

  format(user: User) {
    return {
      id: user.id,
      lastname: user.lastname,
      firstname: user.firstname,
      phone: user.phone,
      fcm_token: user.fcm_token,
      code: user.code,
      app_type: user.app_type,
      status: user.status,
      image: `${process.env.API_URL}${user.image}`,
      card_image: `${process.env.API_URL}${user.card_image}`,
      card_number: user.card_number,
      signature: `${process.env.API_URL}${user.signature}`,
      person_card: `${process.env.API_URL}${user.person_card}`,
      sexe: user.sexe,
      balance_mtn: user.balance_mtn,
      balance_moov: user.balance_moov,
      wishlistedProperties: user.wishlistedProperties,
      roles: user.roles,
      properties: user.properties,
      ownProperties: user.ownProperties,
      visits: user.visits,
      managedVisits: user.managedVisits,
      ownerContracts:
        user.ownerContracts?.filter(
          (contract) => contract.status === StatusContractEnum.ACTIVE,
        ) || [],
      contracts:
        user.contracts?.filter(
          (contract) => contract.status === StatusContractEnum.ACTIVE,
        ) || [],
    };
  }

  formatCollection(users: User[]) {
    return users.map((user) => this.format(user));
  }

  // Nouvelle méthode pour calculer les statistiques globales
  getGlobalLandlordStats(contracts: Contract[]) {
    if (!contracts || contracts.length === 0) {
      return {
        total_balance_due: 0,
        total_months_late: 0,
        total_months_paid: 0,
        total_contracts: 0,
      };
    }

    const stats = {
      total_balance_due: 0,
      total_months_late: 0,
      total_months_paid: 0,
      total_contracts: contracts.length,
    };

    for (const contract of contracts) {
      stats.total_balance_due += this.getBalanceDue(contract);
      stats.total_months_late += this.getMonthsLate(contract);
      stats.total_months_paid += this.getMonthsPaid(contract);
    }

    return stats;
  }

  // Méthodes utilitaires pour les statistiques
  getBalanceDue(contract: Contract) {
    const balance = contract.dues.reduce((acc, due) => {
      let pendingInvoicesTotal = 0;
      if (Array.isArray(due.invoices)) {
        pendingInvoicesTotal = due.invoices
          .filter((item) => item.status != 'PAID')
          .reduce((sum, item) => sum + item.carry_over_amount, 0);
      }

      if (due.status_due !== StatusDueEnum.FINISHED) {
        acc += due.carry_over_amount;
      }

      acc += pendingInvoicesTotal;

      return acc;
    }, 0);
    return balance;
  }

  getMonthsLate(contract: Contract) {
    return contract.dues.reduce((acc, due) => {
      if (due.status_due != StatusDueEnum.FINISHED) {
        acc += 1;
      }
      return acc;
    }, 0);
  }

  getMonthsPaid(contract: Contract) {
    return contract.dues.reduce((acc, due) => {
      if (due.status_due == StatusDueEnum.FINISHED) {
        acc += 1;
      }
      return acc;
    }, 0);
  }
}
