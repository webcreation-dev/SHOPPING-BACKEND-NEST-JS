import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { StorageService } from 'files/storage/storage.service';
import { join } from 'path';
import { BASE_PATH } from 'files/utils/file.constant';
import { Gallery } from './entities/gallery.entity';
import { DataSource } from 'typeorm';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(Gallery)
    private readonly galleriesRepository: Repository<Gallery>,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    files: Express.Multer.File[],
  ): Promise<Property> {
    return this.dataSource.transaction(async (manager) => {
      const propertyRepository = manager.getRepository(Property);
      const galleryRepository = manager.getRepository(Gallery);

      const property = propertyRepository.create({
        name: createPropertyDto.name,
        description: createPropertyDto.description,
        location: createPropertyDto.location,
      });

      const savedProperty = await propertyRepository.save(property);

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
      return propertyRepository.save(savedProperty);
    });
  }

  findAll(): Promise<Property[]> {
    return this.propertiesRepository.find({
      relations: ['location', 'galleries'],
    });
  }

  findOne(id: string): Promise<Property> {
    return this.propertiesRepository.findOneOrFail({
      where: { id },
      relations: ['location', 'galleries'],
    });
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    files: Express.Multer.File[],
  ): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['galleries'],
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    Object.assign(property, updatePropertyDto);

    if (files && files.length > 0) {
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
    }

    return this.propertiesRepository.save(property);
  }

  async removeGallery(propertyId: string, galleryId: number): Promise<void> {
    const gallery = await this.galleriesRepository.findOneOrFail({
      where: { id: galleryId, property: { id: propertyId } },
    });

    await this.storageService.delete(gallery.url);
    await this.galleriesRepository.remove(gallery);
  }

  async remove(id: string): Promise<void> {
    await this.propertiesRepository.delete(id);
  }
}
