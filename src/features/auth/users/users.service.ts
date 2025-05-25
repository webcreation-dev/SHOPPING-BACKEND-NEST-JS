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
    statContractsMonthDto: StatContractsMonthDto,
  ) {
    const now = new Date();
    const month = statContractsMonthDto?.month ?? now.getMonth() + 1; // Mois actuel (1-12)
    const year = statContractsMonthDto?.year ?? now.getFullYear(); // Année actuelle

    console.log('🚀 [DEBUG] Début statContractsMonth');
    console.log(`📅 [DEBUG] Paramètres: month=${month}, year=${year}`);

    const properties = owner.ownProperties;
    console.log(`🏠 [DEBUG] Nombre de propriétés: ${properties.length}`);

    const stats = {
      occupiedLocations: 0,
      vacantLocations: 0,
      totalPaid: 0,
      totalToReceive: 0,
    };
    console.log('📊 [DEBUG] Stats initialisées:', stats);

    // Date du mois à analyser
    const targetDate = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month, 1);
    console.log(`📆 [DEBUG] Date cible: ${targetDate.toISOString()}`);
    console.log(`📆 [DEBUG] Mois suivant: ${nextMonth.toISOString()}`);

    for (const property of properties) {
      console.log(`\n🏢 [DEBUG] === Analyse propriété ID: ${property.id} ===`);
      console.log(
        `📋 [DEBUG] Nombre de contrats: ${property.contracts.length}`,
      );

      // Contrats actifs pendant le mois ciblé
      const activeContracts = property.contracts.filter((contract) => {
        console.log(`\n📄 [DEBUG] -- Contrat ID: ${contract.id} --`);
        console.log(`📄 [DEBUG] Status: ${contract.status}`);

        if (contract.status !== StatusContractEnum.ACTIVE) {
          console.log('❌ [DEBUG] Contrat non actif - ignoré');
          return false;
        }

        const startDate = new Date(contract.start_date);
        const endDate = contract.end_date ? new Date(contract.end_date) : null;

        console.log(`📄 [DEBUG] Date début: ${startDate.toISOString()}`);
        console.log(
          `📄 [DEBUG] Date fin: ${endDate ? endDate.toISOString() : 'null (indéterminée)'}`,
        );

        // Le contrat est actif si :
        // - Il a commencé avant ou pendant le mois ciblé
        // - ET il n'a pas de date de fin OU sa date de fin est après le début du mois ciblé
        const condition1 = startDate < nextMonth;
        const condition2 = !endDate || endDate >= targetDate;
        const result = condition1 && condition2;

        console.log(
          `📄 [DEBUG] Condition 1 (start < nextMonth): ${condition1}`,
        );
        console.log(
          `📄 [DEBUG] Condition 2 (!endDate || endDate >= targetDate): ${condition2}`,
        );
        console.log(`📄 [DEBUG] Contrat actif ce mois: ${result}`);

        return result;
      });

      console.log(
        `✅ [DEBUG] Contrats actifs trouvés: ${activeContracts.length}`,
      );

      if (activeContracts.length > 0) {
        stats.occupiedLocations += 1;
        console.log(
          `🏠 [DEBUG] Propriété occupée - locations occupées: ${stats.occupiedLocations}`,
        );

        // Calculer les échéances pour le mois spécifique
        for (const contract of activeContracts) {
          console.log(
            `\n💰 [DEBUG] --- Analyse échéances contrat ID: ${contract.id} ---`,
          );
          console.log(
            `💰 [DEBUG] Nombre d'échéances total: ${contract.dues.length}`,
          );

          const monthlyDues = contract.dues.filter((due) => {
            const dueDate = new Date(due.due_date);
            const dueMonth = dueDate.getMonth() + 1;
            const dueYear = dueDate.getFullYear();
            const isTargetMonth = dueMonth === month && dueYear === year;

            console.log(
              `💰 [DEBUG] Échéance ID: ${due.id}, Date: ${dueDate.toISOString()}`,
            );
            console.log(
              `💰 [DEBUG] Mois échéance: ${dueMonth}, Année: ${dueYear}`,
            );
            console.log(
              `💰 [DEBUG] Correspond au mois cible: ${isTargetMonth}`,
            );

            return isTargetMonth;
          });

          console.log(`💰 [DEBUG] Échéances du mois: ${monthlyDues.length}`);

          for (const due of monthlyDues) {
            console.log(`\n💵 [DEBUG] ---- Échéance ID: ${due.id} ----`);
            console.log(`💵 [DEBUG] Status: ${due.status_due}`);
            console.log(`💵 [DEBUG] Montant payé: ${due.amount_paid}`);
            console.log(`💵 [DEBUG] Montant restant: ${due.carry_over_amount}`);

            if (due.status_due === StatusDueEnum.FINISHED) {
              stats.totalPaid += due.amount_paid;
              console.log(
                `💵 [DEBUG] Ajouté au total payé - Nouveau total: ${stats.totalPaid}`,
              );
            } else {
              stats.totalToReceive += due.carry_over_amount;
              console.log(
                `💵 [DEBUG] Ajouté au total à recevoir - Nouveau total: ${stats.totalToReceive}`,
              );
            }
          }
        }
      } else {
        stats.vacantLocations += 1;
        console.log(
          `🏠 [DEBUG] Propriété vacante - locations vacantes: ${stats.vacantLocations}`,
        );
      }
    }

    console.log('\n🎯 [DEBUG] === RÉSULTATS FINAUX ===');
    console.log('📊 [DEBUG] Stats finales:', stats);
    console.log('✅ [DEBUG] Fin statContractsMonth');
    return stats;
  }
}
