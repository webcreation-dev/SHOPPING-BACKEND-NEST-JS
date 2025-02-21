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
  Roles,
  RoleEnum,
  HeaderOperation,
} from '@app/common';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilenamesDto } from '@app/common';
import { PropertiesQueryDto } from './dto/querying/properties-query.dto';
import { User } from '../auth/users/entities/user.entity';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HeaderOperation('CREATE PROPERTY', CreatePropertyDto)
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PROPERTY_IMAGES))
  create(
    @Body() createPropertyDto: CreatePropertyDto,

    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: File[],

    @CurrentUser()
    user: User,
  ) {
    return this.propertiesService.create(createPropertyDto, files, user);
  }

  @Get()
  @Roles(RoleEnum.MANAGER)
  @HeaderOperation('GET ALL', PropertiesQueryDto)
  findAll(@Query() propertiesQueryDto: PropertiesQueryDto) {
    return this.propertiesService.findAll(propertiesQueryDto);
  }

  @Get(':id')
  @HeaderOperation('GET ONE PROPERTY')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @HeaderOperation('UPDATE PROPERTY', UpdatePropertyDto)
  update(@Param() { id }: IdDto, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }
  @Delete(':id')
  @HeaderOperation('DELETE PROPERTY')
  async remove(@Param() { id }: IdDto) {
    return this.propertiesService.remove(id);
  }

  @Post(':id/images')
  @HeaderOperation('ADD IMAGES PROPERTY')
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PRODUCT_IMAGES))
  addImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: File[],
  ) {
    return this.propertiesService.addImages(id, files);
  }

  @Delete(':id/images')
  @HeaderOperation('DELETE IMAGES PROPERTY', FilenamesDto)
  deleteImages(
    @Param('id', ParseIntPipe) id: number,
    @Body() { filenames }: FilenamesDto,
  ) {
    return this.propertiesService.deleteImages(id, filenames);
  }
}
