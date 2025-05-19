import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  // UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  createParseFilePipe,
  File,
  IdDto,
  MaxFileCount,
  CurrentUser,
  // Roles,
  HeaderOperation,
  MULTIPART_FORMDATA_KEY,
  ApiPaginatedResponse,
  // RolesGuard,
} from '@app/common';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilenamesDto } from '@app/common';
import { PropertiesQueryDto } from './dto/querying/properties-query.dto';
import { User } from '../auth/users/entities/user.entity';
import { Property } from './entities/property.entity';
import { FilesSchema } from 'libs/common/src/files/swagger/schemas/files.schema';
import { ApiConsumes } from '@nestjs/swagger';
import { AddArticlesDto } from './dto/articles/add-article.dto';
import { UpdateArticleDto } from './dto/articles/update-article.dto';
import { RemoveArticleDto } from './dto/articles/remove-article.dto';
import { AddOwnerDto } from './dto/articles/add-owner.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  // @Roles(RoleEnum.USER)
  @HeaderOperation('CREATE ', CreatePropertyDto)
  // @UseInterceptors(FilesInterceptor('files', MaxFileCount.PROPERTY_IMAGES))
  async create(
    @Body() createPropertyDto: CreatePropertyDto,

    // @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    // files: File[],

    @CurrentUser()
    user: User,
  ) {
    // return await this.propertiesService.create(createPropertyDto, files, user);
    return await this.propertiesService.create(createPropertyDto, user);
  }

  @Get('/all/all')
  @ApiPaginatedResponse(Property)
  @HeaderOperation('GET ALL', PropertiesQueryDto, null, true)
  getAll(@Query() propertiesQueryDto: PropertiesQueryDto) {
    return this.propertiesService.getAll(propertiesQueryDto);
  }

  @Get()
  @ApiPaginatedResponse(Property)
  @HeaderOperation('FIND ALL', PropertiesQueryDto)
  findAll(
    @Query() propertiesQueryDto: PropertiesQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.findAll(user, propertiesQueryDto);
  }

  @Get(':id')
  @HeaderOperation('GET ONE', null, null, true)
  // @Roles(RoleEnum.MANAGER)
  // @UseGuards(RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.propertiesService.findOne(id);
  }

  @Patch(':id')
  // @Roles(RoleEnum.MANAGER)
  @HeaderOperation('UPDATE ', UpdatePropertyDto)
  update(@Param() { id }: IdDto, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  // @Roles(RoleEnum.MANAGER)
  @HeaderOperation('DELETE PROPERTY')
  async remove(@Param() { id }: IdDto) {
    return this.propertiesService.remove(id);
  }

  @Post(':id/images')
  // @Roles(RoleEnum.MANAGER)
  @HeaderOperation('ADD IMAGES', FilesSchema)
  @ApiConsumes(MULTIPART_FORMDATA_KEY)
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PRODUCT_IMAGES))
  addImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: File[],
  ) {
    return this.propertiesService.addImages(id, files);
  }

  @Delete(':id/images')
  // @Roles(RoleEnum.MANAGER)
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PROPERTY_IMAGES))
  @HeaderOperation('DELETE IMAGES', FilenamesDto)
  deleteImages(
    @Param('id', ParseIntPipe) id: number,
    @Body() { filenames }: FilenamesDto,
  ) {
    return this.propertiesService.deleteImages(id, filenames);
  }

  @Patch(':id/add_articles')
  @HeaderOperation('ADD ARTICLES', AddArticlesDto)
  addArticles(@Param() { id }: IdDto, @Body() addArticlesDto: AddArticlesDto) {
    return this.propertiesService.addArticles(id, addArticlesDto);
  }

  @Patch(':id/add_owner')
  @HeaderOperation('ADD OWNER', AddOwnerDto)
  addOwner(@Param() { id }: IdDto, @Body() addOwnerDto: AddOwnerDto) {
    return this.propertiesService.addOwner(id, addOwnerDto);
  }

  @Patch(':id/update_article')
  @HeaderOperation('UPDATE ARTICLE', UpdateArticleDto)
  updateArticle(
    @Param() { id }: IdDto,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.propertiesService.updateArticle(id, updateArticleDto);
  }

  @Delete(':id/remove_article')
  @HeaderOperation('REMOVE ARTICLE', RemoveArticleDto)
  removeArticle(
    @Param() { id }: IdDto,
    @Body() { article_id }: RemoveArticleDto,
  ) {
    return this.propertiesService.removeArticle(id, article_id);
  }
}
