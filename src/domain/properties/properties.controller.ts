import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { createParseFilePipe } from 'files/utils/file-validation.util';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  MaxFileCount,
  MULTIPART_FORMDATA_KEY,
} from 'files/utils/file.constant';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PROPERTY_IMAGES))
  @ApiConsumes(MULTIPART_FORMDATA_KEY)
  @ApiBody({ type: CreatePropertyDto })
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    return this.propertiesService.create(createPropertyDto, files);
  }

  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PROPERTY_IMAGES)) // Utilisation du champ 'files'
  @ApiConsumes(MULTIPART_FORMDATA_KEY)
  @ApiBody({ type: UpdatePropertyDto })
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
