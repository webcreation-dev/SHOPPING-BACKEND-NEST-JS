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
import { PaginationDto } from 'querying/dto/pagination.dto';
import { DefaultPageSize } from 'querying/util/querying.constants';
import { PaginationService } from 'querying/pagination.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly paginationService: PaginationService,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const user = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page } = paginationDto;
    const limit = paginationDto.limit ?? DefaultPageSize.CATEGORY;
    const offset = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.categoriesRepository.findAndCount({
      skip: offset,
      take: limit,
    });
    const meta = this.paginationService.createMeta(limit, page, count);

    return { data, meta };
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOneOrFail({
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
