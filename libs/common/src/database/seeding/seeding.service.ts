import { Injectable } from '@nestjs/common';
import { User } from 'src/features/auth/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { Gallery } from 'src/features/properties/entities/gallery.entity';
import { Property } from 'src/features/properties/entities/property.entity';
import { Contract } from 'src/features/contracts/entities/contract.entity';
import { Due } from 'src/features/contracts/entities/due.entity';
import { StatusContractEnum } from 'src/features/contracts/enums/status-contract.enum';

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

      // ✅ 1. Delete all data
      await usersRepository.delete({});
      await propertiesRepository.delete({});
      await galleriesRepository.delete({});
      await contractsRepository.delete({});

      // ✅ 2. Charger les données
      const usersData = JSON.parse(
        fs.readFileSync(
          'libs/common/src/database/seeding/data/user.json',
          'utf8',
        ),
      );
      const propertiesData = JSON.parse(
        fs.readFileSync(
          'libs/common/src/database/seeding/data/properties.json',
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

      // ✅ CONTRACTS & DUES
      const contract = contractsRepository.create(
        new Contract({
          tenant: savedUsers[0],
          landlord: savedUsers[1],
          property: savedProperties[11],
          start_date: new Date(),
          end_date: new Date(),
          articles: savedProperties[11].articles,
          rent_price: savedProperties[11].rent_price,
          caution: savedProperties[11].caution,
          status: StatusContractEnum.ACTIVE,
        }),
      );
      const saveContract = await contractsRepository.save(contract);

      // create dues

      const due_date = [
        '2025-04-05T21:45:30.879Z',
        '2025-05-05T21:45:30.879Z',
        '2025-06-05T21:45:30.879Z',
      ];

      for (const date of due_date) {
        const due = duesRepository.create(
          new Due({
            contract: saveContract,
            due_date: new Date(date),
            carry_over_amount: saveContract.rent_price,
          }),
        );
        await duesRepository.save(due);
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
