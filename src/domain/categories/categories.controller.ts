import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IdDto } from 'common/dto/id.dto';
import { PaginationDto } from 'querying/dto/pagination.dto';
import { Public } from 'auth/decorators/public.decorator';
import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/roles/enums/role.enum';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(Role.MANAGER)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Public()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoriesService.findAll(paginationDto);
  }

  @Public()
  @Get(':id')
  findOne(@Param() { id }: IdDto) {
    return this.categoriesService.findOne(id);
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  update(@Param() { id }: IdDto, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Roles(Role.MANAGER)
  @Delete(':id')
  remove(@Param() { id }: IdDto) {
    return this.categoriesService.remove(id);
  }
}
