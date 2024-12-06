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

  /**
   * Creates a new property.
   *
   * This function is wrapped in a transaction and will rollback if any of the operations fail.
   * @param createPropertyDto The dto containing the information for the new property.
   * @param files The files to be added to the property's gallery.
   * @param user The user creating the property.
   * @returns The newly created property.
   */
  async create(
    createPropertyDto: CreatePropertyDto,
    files: Express.Multer.File[],
    user: User,
  ): Promise<Property> {
    return this.dataSource.transaction(async (manager) => {
      const propertyRepo = manager.getRepository(Property);
      const galleryRepo = manager.getRepository(Gallery);

      const newProperty = propertyRepo.create({
        ...createPropertyDto,
        owner: user,
      });

      const savedProperty = await propertyRepo.save(newProperty);

      const galleryDir = join(
        BASE_PATH,
        'properties',
        savedProperty.id.toString(),
        'gallery',
      );
      await this.storageService.createDir(galleryDir);

      const galleryEntities = files.map((file) => {
        const uniqueFilename = this.storageService.genUniqueFilename(
          file.originalname,
        );
        return galleryRepo.create({
          url: join(galleryDir, uniqueFilename),
          property: savedProperty,
        });
      });

      await this.storageService.saveFiles(galleryDir, files);
      await galleryRepo.save(galleryEntities);

      savedProperty.galleries = galleryEntities;
      return propertyRepo.save(savedProperty);
    });
  }

  /**
   * Retrieve a list of properties, with optional filtering by name and price, and pagination.
   *
   * @param propertiesQueryDto The query object containing the filters and pagination information.
   * @returns A promise resolving to an object containing the list of properties and the pagination metadata.
   */
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

  /**
   * Retrieves a property by its ID.
   *
   * @param id - The ID of the property to retrieve.
   * @returns A promise that resolves to the Property entity.
   */
  async findOne(id: number): Promise<Property> {
    return await this.propertiesRepository.findOneOrFail({
      where: { id },
      relations: ['location', 'galleries'],
    });
  }

  /**
   * Updates a property by its ID.
   *
   * @param propertyId The ID of the property to update.
   * @param updatePropertyDto The properties to update.
   * @returns The updated property.
   */
  async update(
    propertyId: number,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.propertiesRepository.preload({
      id: propertyId,
      ...updatePropertyDto,
    } as Partial<Property>);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.propertiesRepository.save(property);
  }

  /**
   * Add the specified galleries to the property with the given ID.
   *
   * @param propertyId The ID of the property.
   * @param files The files to upload.
   * @returns The updated property with the galleries added.
   */
  async addGallery(
    propertyId: number,
    files: Express.Multer.File[],
  ): Promise<Property> {
    const property = await this.propertiesRepository.findOneOrFail({
      where: { id: propertyId },
    });

    const galleryDirectory = join(
      BASE_PATH,
      'properties',
      propertyId.toString(),
      'gallery',
    );

    await this.storageService.createDir(galleryDirectory);

    const galleries = await Promise.all(
      files.map(async (file) => {
        const uniqueFilename = this.storageService.genUniqueFilename(
          file.originalname,
        );
        const filePath = join(galleryDirectory, uniqueFilename);
        await this.storageService.saveFile(galleryDirectory, {
          ...file,
          originalname: uniqueFilename,
        });
        return this.galleriesRepository.create({
          url: filePath,
          property,
        });
      }),
    );

    await this.galleriesRepository.save(galleries);

    property.galleries = [...(property.galleries || []), ...galleries];

    return this.propertiesRepository.save(property);
  }

  /**
   * Remove the specified galleries from the property with the given ID.
   *
   * @throws {NotFoundException} If some galleries do not exist for the property.
   *
   * @param id The ID of the property.
   * @param {RemoveGalleryDto} removeGalleryDto The IDs of the galleries to remove.
   */
  async removeGallery(
    id: number,
    { galleryIds }: RemoveGalleryDto,
  ): Promise<void> {
    const deletedGalleries = await this.galleriesRepository.delete({
      id: In(galleryIds.map((galleryId) => galleryId.id)),
      property: { id: id },
    });

    if (deletedGalleries.affected !== galleryIds.length) {
      throw new NotFoundException(
        `Some galleries not found for property with ID ${id}`,
      );
    }

    const galleriesToRemove = await this.galleriesRepository.findBy({
      id: In(galleryIds.map((galleryId) => galleryId.id)),
    });
    await Promise.all(
      galleriesToRemove.map((gallery) =>
        this.storageService.delete(gallery.url),
      ),
    );
  }

  /**
   * Soft deletes a property by its ID.
   *
   * @param id The ID of the property to be deleted.
   * @returns A promise that resolves when the property has been soft deleted.
   */
  async remove(id: number): Promise<void> {
    await this.propertiesRepository.softDelete(id);
  }

  /**
   * Retrieves the properties owned by a specified user.
   *
   * @param user The user whose properties are to be retrieved.
   * @returns A promise that resolves to an array of Property objects.
   */
  async findPropertiesByUser(user: User): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { owner: user },
      relations: ['location', 'galleries'],
    });
  }

  /**
   * Toggle a property in a user's wishlist.
   *
   * @param user The user whose wishlist to modify.
   * @param propertyId The ID of the property to add or remove.
   * @returns A promise that resolves to void when the operation is complete.
   */
  async toggleWishlist(user: User, propertyId: number): Promise<void> {
    user = await this.usersRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['wishlist'],
    });

    const property = await this.propertiesRepository.findOneOrFail({
      where: { id: propertyId },
    });

    const isPropertyInWishlist = user.wishlist.some(
      (wishlistProperty) => wishlistProperty.id === propertyId,
    );

    if (isPropertyInWishlist) {
      user.wishlist = user.wishlist.filter(
        (wishlistProperty) => wishlistProperty.id !== propertyId,
      );
    } else {
      user.wishlist.push(property);
    }

    await this.usersRepository.save(user);
  }

  /**
   * Retrieves the wishlist properties of a user.
   *
   * @param user The user whose wishlist is to be retrieved.
   * @returns A promise that resolves to the list of properties in the user's wishlist.
   */
  async getUserWishlist(user: User): Promise<Property[]> {
    user = await this.usersRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['wishlist'],
    });

    const wishlistIds = user.wishlist.map(
      (wishlistProperty) => wishlistProperty.id,
    );
    return this.propertiesRepository.find({ where: { id: In(wishlistIds) } });
  }
}
