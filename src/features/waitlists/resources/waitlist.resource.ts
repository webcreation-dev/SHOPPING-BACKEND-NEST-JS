import { Waitlist } from '../entities/waitlist.entity';

export class WaitlistResource {
  constructor() {}

  format(waitlist: Waitlist) {
    return {
      id: waitlist.id,
      lastname: waitlist.lastname,
      firstname: waitlist.firstname,
      phone: waitlist.phone,
      email: waitlist.email,
      business_sector: waitlist.business_sector,
      category: waitlist.category,
      expectations: waitlist.expectations,
      used_infos: waitlist.used_infos,
    };
  }

  formatCollection(waitlists: Waitlist[]) {
    return waitlists.map((waitlist) => this.format(waitlist));
  }
}
