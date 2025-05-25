import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { PropertiesService } from 'src/features/properties/properties.service';
import { ToggleWishlistDto } from './dto/toggle-wishlist.dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { UserResource } from 'src/features/auth/resources/user.resource';
import { SearchUserByCodeDto } from './dto/search-user-by-code.dto';
import { StatusContractEnum } from 'src/features/contracts/enums/status-contract.enum';
import { StatusDueEnum } from 'src/features/contracts/enums/status-due.enum';
import { StatContractsMonthDto } from './dto/stat-contracts-month.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => PropertiesService))
    private readonly propertiesService: PropertiesService,
    private readonly userResource: UserResource,
  ) {}

  async findOne(id: number) {
    return this.userResource.format(
      await this.usersRepository.findOne(
        { id },
        {
          roles: true,
          properties: true,
          ownProperties: true,
          visits: true,
          managedVisits: true,
          ownerContracts: true,
          contracts: true,
        },
      ),
    );
  }

  async findAll(): Promise<any> {
    return this.userResource.formatCollection(
      await this.usersRepository.find({}),
    );
  }

  async searchUserByCode({ code }: SearchUserByCodeDto) {
    const user = await this.usersRepository.findOne({ code });
    return await this.findOne(user.id);
  }

  async create(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);
    return this.usersRepository.create(user);
  }

  async validateUser(validateUserDto: ValidateUserDto) {
    await this.findOne(validateUserDto.user_id);
    return this.usersRepository.findOneAndUpdate(
      { id: validateUserDto.user_id },
      { status: validateUserDto.status },
    );
  }

  async toogleWishlist(user: User, toggleWishlistDto: ToggleWishlistDto) {
    return await this.propertiesService.toogleWishlist(user, toggleWishlistDto);
  }

  async getWishlist(user: User) {
    return await this.propertiesService.getWishlist(user);
  }

  async statContractsMonth(
    owner: User,
    { month, year }: StatContractsMonthDto,
  ) {
    const properties = owner.ownProperties;
    const stats = {
      occupiedLocations: 0,
      vacantLocations: 0,
      totalPaid: 0,
      totalToReceive: 0,
    };

    // Date du mois à analyser
    const targetDate = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month, 1);

    for (const property of properties) {
      // Contrats actifs pendant le mois ciblé
      const activeContracts = property.contracts.filter((contract) => {
        if (contract.status !== StatusContractEnum.ACTIVE) return false;

        const startDate = new Date(contract.start_date);
        const endDate = contract.end_date ? new Date(contract.end_date) : null;

        // Le contrat est actif si :
        // - Il a commencé avant ou pendant le mois ciblé
        // - ET il n'a pas de date de fin OU sa date de fin est après le début du mois ciblé
        return startDate < nextMonth && (!endDate || endDate >= targetDate);
      });

      if (activeContracts.length > 0) {
        stats.occupiedLocations += 1;

        // Calculer les échéances pour le mois spécifique
        for (const contract of activeContracts) {
          const monthlyDues = contract.dues.filter((due) => {
            const dueDate = new Date(due.due_date); // Supposant une propriété due_date
            return (
              dueDate.getMonth() + 1 === month && dueDate.getFullYear() === year
            );
          });

          for (const due of monthlyDues) {
            if (due.status_due === StatusDueEnum.FINISHED) {
              stats.totalPaid += due.amount_paid;
            } else {
              stats.totalToReceive += due.carry_over_amount;
            }
          }
        }
      } else {
        stats.vacantLocations += 1;
      }
    }

    return stats;
  }
}
