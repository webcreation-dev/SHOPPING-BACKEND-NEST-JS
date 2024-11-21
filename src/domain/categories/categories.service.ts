import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'common/dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'common/util/common.constants';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const user = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(user);
  }

  findAll(paginationDto: PaginationDto) {
    const { limit, offset } = paginationDto;

    return this.categoriesRepository.find({
      skip: offset,
      take: limit ?? DEFAULT_PAGE_SIZE.CATEGORY,
    });
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: {
        products: true,
      },
    });
    if (category.products.length) {
      throw new ConflictException('Category has related products');
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.preload({
      id,
      ...updateCategoryDto,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.categoriesRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (category.products.length) {
      throw new ConflictException('Category has related products');
    }
    return this.categoriesRepository.remove(category);
  }
}
