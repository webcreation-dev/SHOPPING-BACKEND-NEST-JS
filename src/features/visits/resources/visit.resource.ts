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
      // galleries: visit.property.galleries.map((gallery) => ({
      //   ...gallery,
      //   url: `${process.env.API_URL}${gallery.url}`,
      // })),
      manager: visit.manager,
    };
  }

  formatCollection(visits: Visit[]) {
    return visits.map((visit) => this.format(visit));
  }
}
