import { Injectable } from '@nestjs/common';
import { User } from 'src/features/auth/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { Gallery } from 'src/features/properties/entities/gallery.entity';
import { Property } from 'src/features/properties/entities/property.entity';
import { Contract } from 'src/features/contracts/entities/contract.entity';
import { Due } from 'src/features/contracts/entities/due.entity';
import { StatusContractEnum } from 'src/features/contracts/enums/status-contract.enum';
import { Annuity } from 'src/features/contracts/entities/annuity.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const usersRepository = queryRunner.manager.getRepository(User);
      const propertiesRepository = queryRunner.manager.getRepository(Property);
      const galleriesRepository = queryRunner.manager.getRepository(Gallery);
      const contractsRepository = queryRunner.manager.getRepository(Contract);
      const duesRepository = queryRunner.manager.getRepository(Due);
      const annuitiesRepository = queryRunner.manager.getRepository(Annuity);

      // ✅ 1. Delete all data
      await usersRepository.delete({});
      await propertiesRepository.delete({});
      await galleriesRepository.delete({});
      await contractsRepository.delete({});
      await duesRepository.delete({});
      await annuitiesRepository.delete({});

      // ✅ 2. Charger les données
      const usersData = JSON.parse(
        fs.readFileSync(
          'libs/common/src/database/seeding/data/users.json',
          'utf8',
        ),
      );
      const propertiesData = JSON.parse(
        fs.readFileSync(
          'libs/common/src/database/seeding/data/properties.json',
          'utf8',
        ),
      );
      const contractsData = JSON.parse(
        fs.readFileSync(
          'libs/common/src/database/seeding/data/contracts.json',
          'utf8',
        ),
      );

      const duesData = JSON.parse(
        fs.readFileSync(
          'libs/common/src/database/seeding/data/dues.json',
          'utf8',
        ),
      );

      // ✅ 3. Insert data

      // ✅ USERS
      const savedUsers = [];
      for (const userData of usersData) {
        const user = usersRepository.create(userData);
        savedUsers.push(await usersRepository.save(user));
      }

      // ✅ PROPERTIES & GALLERIES
      const savedProperties = [];
      for (const propertyData of propertiesData) {
        const property = propertiesRepository.create(
          new Property({
            ...propertyData,
            user: savedUsers[1],
            owner: savedUsers[2],
          }),
        );
        savedProperties.push(property);
        const savedProperty = await propertiesRepository.save(property);

        // Ajout des images à la galerie
        for (const imagePath of propertyData.images) {
          const gallery = galleriesRepository.create(
            new Gallery({
              url: imagePath,
              property: savedProperty,
            }),
          );
          await galleriesRepository.save(gallery);
        }
      }

      // ✅ CONTRACTS & DUES & ANNUITIES
      const savedContracts = [];

      for (const contractData of contractsData) {
        const contract = contractsRepository.create({
          tenant: savedUsers[0],
          landlord: savedUsers[2],
          property: savedProperties[11],
          start_date: new Date(),
          end_date: new Date(),
          articles: savedProperties[11].articles,
          rent_price: savedProperties[11].rent_price,
          caution: savedProperties[11].caution,
          status: StatusContractEnum.ACTIVE,
        });

        const savedContract = await contractsRepository.save(contract);
        savedContracts.push(savedContract);

        await Promise.all(
          duesData.map(async (item) => {
            const due = duesRepository.create({
              contract: savedContract,
              due_date: new Date(item.date),
              amount_paid: savedContract.rent_price - item.balance,
              carry_over_amount: item.balance,
              status_due: item.status_due,
            });
            const saveDue = await duesRepository.save(due);

            item.annuities.forEach(async (data) => {
              const annuity = annuitiesRepository.create({
                amount: data.amount,
                due: saveDue,
              });
              await annuitiesRepository.save(annuity);
            });
          }),
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
