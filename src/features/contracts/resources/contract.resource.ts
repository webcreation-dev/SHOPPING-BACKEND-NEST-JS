import { Contract } from '../entities/contract.entity';
import { StatusDueEnum } from '../enums/status-due.enum';

export class ContractResource {
  constructor() {}

  format(contract: Contract) {
    return {
      id: contract.id,
      balance_due: this.getBalanceDue(contract),
      is_gerant_locapay: contract.is_gerant_locapay,
      month_late: this.getMonthsLate(contract),
      month_paid: this.getMonthsPaid(contract),
      next_payment_date: this.getNextPaymentDate(contract),
      start_date: contract.start_date,
      end_date: contract.end_date,
      rent_price: contract.rent_price,
      caution: contract.caution,
      articles: contract.articles,
      status: contract.status,
      property: contract.property,
      landlord: contract.landlord,
      tenant: contract.tenant,
      dues: contract.dues,
    };
  }

  formatCollection(properties: Contract[]) {
    return properties.map((contract) => this.format(contract));
  }

  getBalanceDue(contract: Contract) {
    const balance = contract.dues.reduce((acc, due) => {
      let pendingInvoicesTotal = 0;
      if (Array.isArray(due.invoices)) {
        pendingInvoicesTotal = due.invoices
          .filter((item) => item.status === 'PENDING')
          .reduce((sum, item) => sum + item.amount, 0);
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

  getNextPaymentDate(contract: Contract): Date {
    return contract.dues
      ?.filter((due) => due.status_due != StatusDueEnum.WAITING)
      .pop()?.due_date;
  }
}
