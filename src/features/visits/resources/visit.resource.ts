import { Visit } from '../entities/visit.entity';

export class VisitResource {
  constructor() {}

  format(visit: Visit) {
    return {
      id: visit.id,
      code: visit.code,
      date: visit.date,
      is_taken: visit.is_taken,
      is_paid: visit.is_paid,
      status: visit.status,
      user: visit.user,
      property: visit.property,
      manager: visit.manager,
    };
  }

  formatCollection(visits: Visit[]) {
    return visits.map((visit) => this.format(visit));
  }
}
