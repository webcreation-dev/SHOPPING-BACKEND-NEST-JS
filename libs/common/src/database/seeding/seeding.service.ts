import { Injectable } from '@nestjs/common';
import { User } from 'src/features/auth/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { Gallery } from 'src/features/properties/entities/gallery.entity';
import { Property } from 'src/features/properties/entities/property.entity';

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

      // ✅ 1. Delete all data
      await usersRepository.delete({});

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
      for (const propertyData of propertiesData) {
        const property = propertiesRepository.create(
          new Property({
            ...propertyData,
            user: savedUsers[0],
          }),
        );
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

      // ✅ USERS
      // for (const userData of usersData) {
      //   const user = usersRepository.create(userData);
      //   savedUsers.push(await usersRepository.save(user));
      // }

      // // ✅ PROPERTIES & GALLERIES
      // for (const propertyData of propertiesData) {
      //   // Création et sauvegarde de la propriété
      //   const property = propertiesRepository.create({
      //     ...propertyData,
      //     user: savedUsers[0], // Associer à un utilisateur existant
      //   });

      //   const savedProperty = await propertiesRepository.save(property);

      //   // Ajout des images à la galerie
      //   for (const imagePath of propertyData.images) {
      //     const gallery = galleriesRepository.create({
      //       url: imagePath,
      //       property: savedProperty, // Associer la propriété sauvegardée
      //     });

      //     await galleriesRepository.save(gallery);
      //   }
      // }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
