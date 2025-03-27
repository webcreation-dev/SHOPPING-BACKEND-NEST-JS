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
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PropertiesRepository } from './properties.repository';
import { join } from 'path';
import { pathExists } from 'fs-extra';
import { GalleriesRepository } from './galleries.repository';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './entities/property.entity';
import { Gallery } from './entities/gallery.entity';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesQueryDto } from './dto/querying/properties-query.dto';
import { FindOptionsOrder } from 'typeorm';
import { User } from '../auth/users/entities/user.entity';
import { UsersService } from '../auth/users/users.service';
import { ToggleWishlistDto } from '../auth/users/dto/toggle-wishlist.dto';
import { UsersRepository } from '../auth/users/users.repository';
import { AddArticlesDto } from './dto/articles/add-article.dto';
import { UpdateArticleDto } from './dto/articles/update-article.dto';
import { PropertyResource } from './resources/property.resource';
import { TypePropertyEnum } from './enums/type_property.enum';
import { TarificationEnum } from './enums/tarification.enum';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly propertiesRepository: PropertiesRepository,
    private readonly galleriesRepository: GalleriesRepository,
    private readonly storageService: StorageService,
    private readonly paginationService: PaginationService,
    private readonly filteringService: FilteringService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => UsersRepository))
    private readonly usersRepository: UsersRepository,
    private readonly propertyResource: PropertyResource,
  ) {}

  async findAll(propertiesQueryDto: PropertiesQueryDto) {
    const {
      page,
      name,
      price,
      sort,
      order,
      type,
      tarification,
      to_sell,
      district,
      municipality,
      department,
    } = propertiesQueryDto;

    const limit = propertiesQueryDto.limit ?? DefaultPageSize.PROPERTY;
    const offset = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.propertiesRepository.findAndCount(
      {
        description: name ? this.filteringService.contains(name) : undefined,
        rent_price: price ? this.filteringService.compare(price) : undefined,
        type: type as TypePropertyEnum,
        tarification: tarification as TarificationEnum,
        district: district
          ? this.filteringService.contains(district)
          : undefined,
        municipality: municipality
          ? this.filteringService.contains(municipality)
          : undefined,
        department: department
          ? this.filteringService.contains(department)
          : undefined,
        to_sell: to_sell ? this.filteringService.isBoolean(to_sell) : undefined,
      },
      {
        relations: {
          galleries: true,
          user: true,
          owner: true,
          visits: true,
          contracts: true,
        },
        order: { [sort]: order } as FindOptionsOrder<Property>,
        skip: offset,
        take: limit,
      },
    );

    const meta = this.paginationService.createMeta(limit, page, count);

    return { data: this.propertyResource.formatCollection(data), meta };
  }

  async create(
    createPropertyDto: CreatePropertyDto,
    // files: File[],
    { id }: User,
  ) {
    const userData = await this.usersRepository.findOne({ id });

    // 1. Sauvegarder la propriété en utilisant PropertyRepository
    const property = await this.propertiesRepository.create(
      new Property({
        ...createPropertyDto,
        user: userData,
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
    return await this.findOne(property.id);
  }

  async findOne(id: number) {
    return this.propertyResource.format(
      await this.propertiesRepository.findOne(
        { id },
        {
          galleries: true,
          user: true,
          owner: true,
          visits: true,
          contracts: true,
        },
      ),
    );
  }

  async findMany(ids: number[]) {
    const results = await Promise.allSettled(ids.map((id) => this.findOne(id)));
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result: PromiseFulfilledResult<any>) => result.value);
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    await this.propertiesRepository.findOneAndUpdate({ id }, updatePropertyDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.propertiesRepository.findOneAndDelete({ id });
    await this.deleteBaseDir(id);
  }

  async addImages(id: number, files: File[]) {
    const property = await this.propertiesRepository.findOne({ id });
    const savedPaths = await this.uploadImages(property.id, files);
    // 3. Créer et sauvegarder chaque galerie
    for (const path of savedPaths) {
      const gallery = new Gallery({
        url: path,
        property, // Associer chaque galerie à la propriété créée
      });
      await this.galleriesRepository.create(gallery);
    }
    return this.findOne(id);
  }

  async deleteImages(id: number, filenames: string[]) {
    await this.findOne(id);

    const { BASE, IMAGES } = FilePath.Properties;

    const deleteOperations = filenames.map(async (filename) => {
      const path = join(BASE, id.toString(), IMAGES, filename);

      await this.storageService.validatePath(path);

      await this.storageService.delete(path);
      await this.galleriesRepository.findOneAndDelete({
        url: join(BASE_PATH, path),
      });
    });

    await Promise.all(deleteOperations);
  }

  async uploadImages(id: number, files: File[]) {
    const { BASE, IMAGES } = FilePath.Properties;
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
        return filePath;
      }),
    );

    return savedPaths;
  }

  private async deleteBaseDir(id: number) {
    const { BASE } = FilePath.Properties;

    const path = join(BASE, id.toString());
    await this.storageService.delete(path);
  }

  async toogleWishlist(user: User, toggleWishlistDto: ToggleWishlistDto) {
    const { property_id } = toggleWishlistDto;

    await this.findOne(property_id);

    if (user.wishlistedProperties.includes(property_id)) {
      user.wishlistedProperties = user.wishlistedProperties.filter(
        (id) => id !== property_id,
      );
    } else {
      user.wishlistedProperties.push(property_id);
    }

    await this.usersRepository.save(user);
    return user;
  }

  async getWishlist(user: User) {
    return await this.findMany(user.wishlistedProperties);
  }

  async addArticles(id: number, addArticlesDto: AddArticlesDto) {
    const property = await this.findOne(id);

    const maxArticleId = property.articles.length
      ? Math.max(...property.articles.map((a) => a.id))
      : 0;

    const newArticles = addArticlesDto.articles.map((article, index) => ({
      id: maxArticleId + index + 1,
      ...article,
    }));

    property.articles = [...property.articles, ...newArticles];

    const updateData: any = { articles: property.articles };

    if (addArticlesDto.owner_code) {
      updateData.owner = await this.usersRepository.findOne({
        code: addArticlesDto.owner_code,
      });
    }

    await this.propertiesRepository.findOneAndUpdate({ id }, updateData);
    return this.findOne(id);
  }

  async updateArticle(id: number, updatedArticle: UpdateArticleDto) {
    const property = await this.findOne(id);

    const articleIndex = property.articles.findIndex(
      (article) => article.id === updatedArticle.article_id,
    );

    property.articles[articleIndex] = {
      ...property.articles[articleIndex],
      ...updatedArticle.article,
    };

    await this.propertiesRepository.findOneAndUpdate(
      { id },
      { articles: property.articles },
    );

    return this.findOne(id);
  }

  async removeArticle(id: number, articleId: number) {
    const property = await this.findOne(id);

    const articleIndex = property.articles.findIndex(
      (article) => article.id === articleId,
    );

    property.articles.splice(articleIndex, 1);

    await this.propertiesRepository.findOneAndUpdate(
      { id },
      { articles: property.articles },
    );

    return this.findOne(id);
  }
}
