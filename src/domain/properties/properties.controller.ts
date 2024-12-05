import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { createParseFilePipe } from 'files/utils/file-validation.util';
import { PropertiesQueryDto } from './dto/querying/properties-query.dto';
import { MaxFileCount } from 'files/utils/file.constant';
import { MultipartFormData } from 'files/decorators/multipart.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @MultipartFormData(CreatePropertyDto, MaxFileCount.PROPERTY_IMAGES)
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    console.log(files, createPropertyDto);
    return this.propertiesService.create(createPropertyDto, files);
  }

  @Get()
  findAll(@Query() propertiesQueryDto: PropertiesQueryDto) {
    return this.propertiesService.findAll(propertiesQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @MultipartFormData(UpdatePropertyDto, MaxFileCount.PROPERTY_IMAGES)
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    return this.propertiesService.update(id, updatePropertyDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
