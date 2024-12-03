import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertiesRepository.create(createPropertyDto);
    return this.propertiesRepository.save(property);
  }

  findAll(): Promise<Property[]> {
    return this.propertiesRepository.find({
      relations: ['location', 'galleries'],
    });
  }

  findOne(id: string): Promise<Property> {
    return this.propertiesRepository.findOne({
      where: { id }, // Filtrage par ID
      relations: ['location', 'galleries'], // Chargement des relations
    });
  }

  async remove(id: string): Promise<void> {
    await this.propertiesRepository.delete(id);
  }
}
