import {
  BASE_PATH,
  DefaultPageSize,
  File,
  FilePath,
  FilteringService,
  MaxFileCount,
  PaginationService,
  StorageService,
} from '@app/common';
import { Injectable } from '@nestjs/common';
import { PropertiesRepository } from './properties.repository';
import { join } from 'path';
import { pathExists } from 'fs-extra';
import { GalleriesRepository } from './galleries.repository';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './models/property.entity';
import { Gallery } from './models/gallery.entity';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesQueryDto } from './dto/querying/properties-query.dto';
import { FindOptionsOrder } from 'typeorm';
import { User } from '../auth/users/entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly propertiesRepository: PropertiesRepository,
    private readonly galleriesRepository: GalleriesRepository,
    private readonly storageService: StorageService,
    private readonly paginationService: PaginationService,
    private readonly filteringService: FilteringService,
  ) {}

  async findAll(propertiesQueryDto: PropertiesQueryDto) {
    const { page, name, price, sort, order } = propertiesQueryDto;

    const limit = propertiesQueryDto.limit ?? DefaultPageSize.PROPERTY;
    const offset = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.propertiesRepository.findAndCount(
      {
        description: name ? this.filteringService.contains(name) : undefined,
        rent_price: price ? this.filteringService.compare(price) : undefined,
      },
      {
        relations: {
          galleries: true,
        },
        order: { [sort]: order } as FindOptionsOrder<Property>,
        skip: offset,
        take: limit,
      },
    );

    const meta = this.paginationService.createMeta(limit, page, count);

    return { data, meta };
  }

  async create(
    createPropertyDto: CreatePropertyDto,
    files: File[],
    { id }: User,
  ) {
    // 1. Sauvegarder la propriété en utilisant PropertyRepository
    const property = await this.propertiesRepository.create(
      new Property({
        ...createPropertyDto,
        userId: id,
      }),
    );

    // 2. Sauvegarder les fichiers dans un dossier
    // const savedPaths = await this.uploadImages(property.id, files);

    // 3. Créer et sauvegarder chaque galerie
    // for (const path of savedPaths) {
    //   const gallery = new Gallery({
    //     url: path,
    //     property,
    //   });
    //   await this.galleriesRepository.create(gallery);
    // }

    // 4. Retourner la propriété avec ses galeries
    return this.propertiesRepository.findOne(
      { id: property.id },
      { galleries: true },
    );
  }

  async findOne(id: number) {
    return this.propertiesRepository.findOne({ id }, { galleries: true });
  }

  async findMany(ids: number[]) {
    const results = await Promise.allSettled(ids.map((id) => this.findOne(id)));
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result: PromiseFulfilledResult<any>) => result.value);
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesRepository.findOneAndUpdate(
      { id },
      updatePropertyDto,
    );
  }

  async remove(id: number) {
    await this.propertiesRepository.findOneAndDelete({ id });
    await this.deleteBaseDir(id);
  }

  async addImages(id: number, files: File[]) {
    // const property = await this.findOne(id);
    // const savedPaths = await this.uploadImages(property.id, files);
    // // 3. Créer et sauvegarder chaque galerie
    // for (const path of savedPaths) {
    //   const gallery = new Gallery({
    //     url: path,
    //     property, // Associer chaque galerie à la propriété créée
    //   });
    //   await this.galleriesRepository.create(gallery);
    // }
    // return this.findOne(id);
  }

  async deleteImages(id: number, filenames: string[]) {
    await this.findOne(id);

    const { BASE, IMAGES } = FilePath.Products;

    const deleteOperations = filenames.map(async (filename) => {
      const path = join(BASE, id.toString(), IMAGES, filename);

      console.log(path);

      await this.storageService.validatePath(path);

      await this.storageService.delete(path);
      await this.galleriesRepository.findOneAndDelete({ url: filename });
    });

    await Promise.all(deleteOperations);
  }

  async uploadImages(id: number, files: File[]) {
    const { BASE, IMAGES } = FilePath.Products;
    const path = join(BASE, id.toString(), IMAGES);

    if (await pathExists(join(BASE_PATH, path))) {
      const incomingFilecount = files.length;
      const dirFilecount = await this.storageService.getDirFilecount(path);
      const totalFilecount = incomingFilecount + dirFilecount;

      this.storageService.validateFilecount(
        totalFilecount,
        MaxFileCount.PRODUCT_IMAGES,
      );
    }

    await this.storageService.createDir(path);

    const savedPaths = await Promise.all(
      files.map(async (file) => {
        const filePath = await this.storageService.saveFile(path, file);
        return filePath; // Retourne le chemin du fichier sauvegardé
      }),
    );

    return savedPaths;
  }

  private async deleteBaseDir(id: number) {
    const { BASE } = FilePath.Products;

    const path = join(BASE, id.toString());
    await this.storageService.delete(path);
  }
}
