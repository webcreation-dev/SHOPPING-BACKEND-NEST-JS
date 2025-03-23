import { Contract } from '../entities/contract.entity';

export class ContractResource {
  constructor() {}

  format(contract: Contract) {
    return {
      id: contract.id,
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
}
