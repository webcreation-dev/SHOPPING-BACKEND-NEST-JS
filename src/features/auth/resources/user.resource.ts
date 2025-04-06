import { User } from '../users/entities/user.entity';
import { StatusContractEnum } from 'src/features/contracts/enums/status-contract.enum';

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
}
