import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { StorageService } from 'files/storage/storage.service';
import { join } from 'path';
import { BASE_PATH } from 'files/utils/file.constant';
import { Gallery } from './entities/gallery.entity';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PaginationService } from 'querying/pagination.service';
import { PropertiesQueryDto } from './dto/querying/properties-query.dto';
import { DefaultPageSize } from 'querying/util/querying.constants';
import { FilteringService } from 'querying/filtering.service';
import { UsersService } from 'domain/users/users.service';
import { User } from 'users/entities/user.entity';
import { RemoveGalleryDto } from './dto/remove-gallery.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(Gallery)
    private readonly galleriesRepository: Repository<Gallery>,
    private readonly paginationService: PaginationService,
    private readonly filteringService: FilteringService,
    private readonly usersservice: UsersService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    files: Express.Multer.File[],
    user: User,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const propertiesRepository = manager.getRepository(Property);
      const galleryRepository = manager.getRepository(Gallery);

      const property = propertiesRepository.create({
        ...createPropertyDto,
        owner: user,
      });

      const savedProperty = await propertiesRepository.save(property);

      const galleryPath = join(
        BASE_PATH,
        'properties',
        savedProperty.id.toString(),
        'gallery',
      );
      await this.storageService.createDir(galleryPath);

      const galleries = await Promise.all(
        files.map(async (file) => {
          const uniqueFilename = this.storageService.genUniqueFilename(
            file.originalname,
          );
          await this.storageService.saveFile(galleryPath, {
            ...file,
            originalname: uniqueFilename,
          });
          const gallery = galleryRepository.create({
            url: join(galleryPath, uniqueFilename),
            property: savedProperty,
          });
          return galleryRepository.save(gallery);
        }),
      );

      savedProperty.galleries = galleries;
      return propertiesRepository.save(savedProperty);
    });
  }

  async findAll(propertiesQueryDto: PropertiesQueryDto) {
    const { page, name, price, sort, order } = propertiesQueryDto;

    const limit = propertiesQueryDto.limit ?? DefaultPageSize.PROPERTY;
    const offset = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.propertiesRepository.findAndCount({
      where: {
        name: name ? this.filteringService.contains(name) : undefined,
        price: price ? this.filteringService.compare(price) : undefined,
      },
      order: { [sort]: order },
      skip: offset,
      take: limit,
      relations: ['location', 'galleries'],
    });
    const meta = this.paginationService.createMeta(limit, page, count);

    return { data, meta };
  }

  findOne(id: number): Promise<Property> {
    return this.propertiesRepository.findOneOrFail({
      where: { id },
      relations: ['location', 'galleries'],
    });
  }

  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.propertiesRepository.findOneOrFail({
      where: { id },
      relations: ['galleries'],
    });

    Object.assign(property, updatePropertyDto);

    return this.propertiesRepository.save(property);
  }

  async addGallery(
    id: number,
    files: Express.Multer.File[],
  ): Promise<Property> {
    const property = await this.propertiesRepository.findOneOrFail({
      where: { id },
      relations: ['galleries'],
    });

    const galleryPath = join(
      BASE_PATH,
      'properties',
      property.id.toString(),
      'gallery',
    );
    await this.storageService.createDir(galleryPath);

    const galleries = await Promise.all(
      files.map(async (file) => {
        const uniqueFilename = this.storageService.genUniqueFilename(
          file.originalname,
        );
        await this.storageService.saveFile(galleryPath, {
          ...file,
          originalname: uniqueFilename,
        });
        const gallery = this.galleriesRepository.create({
          url: join(galleryPath, uniqueFilename),
          property,
        });
        return this.galleriesRepository.save(gallery);
      }),
    );

    property.galleries.push(...galleries);
    return this.propertiesRepository.save(property);
  }

  async removeGallery(id: number, removeGalleryDto: RemoveGalleryDto) {
    const galleryIds = removeGalleryDto.galleryIds.map((gallery) => gallery.id);

    const galleries = await this.galleriesRepository.find({
      where: {
        id: In(galleryIds),
        property: { id },
      },
    });

    if (galleries.length !== galleryIds.length) {
      throw new NotFoundException(
        `Some galleries not found for property with ID ${id}`,
      );
    }

    await Promise.all(
      galleries.map(async (gallery) => {
        await this.storageService.delete(gallery.url);
        await this.galleriesRepository.remove(gallery);
      }),
    );
  }

  async remove(id: number): Promise<void> {
    await this.propertiesRepository.delete(id);
  }

  async findPropertiesByUser(user: User): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { owner: { id: user.id } },
      relations: ['location', 'galleries'],
    });
  }

  async toggleWishlist(user: User, propertyId: number): Promise<void> {
    const property = await this.propertiesRepository.findOneOrFail({
      where: { id: propertyId },
    });

    // Assurez-vous que la wishlist de l'utilisateur est initialisée (vide si elle est undefined)
    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Utilisation de getWishlist pour garantir que la wishlist est un tableau
    const wishlistIndex = (await this.getWishlist(user)).findIndex(
      (p) => p.id === propertyId,
    );

    if (wishlistIndex === -1) {
      user.wishlist.push(property);
    } else {
      user.wishlist.splice(wishlistIndex, 1);
    }

    await this.usersRepository.save(user);
  }

  async getWishlist(user: User): Promise<Property[]> {
    const userWithWishlist = await this.usersRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['wishlist'],
    });
    return userWithWishlist.wishlist || [];
  }
}
