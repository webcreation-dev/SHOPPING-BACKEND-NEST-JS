import { Due } from '../entities/due.entity';

export class DueResource {
  constructor() {}

  format(due: Due) {
    return {
      id: due.id,
      amount_paid: due.amount_paid,
      carry_over_amount: due.carry_over_amount,
      due_date: due.due_date,
      status_due: due.status_due,
      annuities: due.annuities,
    };
  }

  formatCollection(properties: Due[]) {
    return properties.map((due) => this.format(due));
  }
}
