import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { createParseFilePipe } from 'files/utils/file-validation.util';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesQueryDto } from './dto/querying/properties-query.dto';
import { BodyInterceptor } from 'files/interceptors/body/body.interceptor';
import { FilesSchema } from 'files/swagger/schemas/files.schema';
import {
  MaxFileCount,
  MULTIPART_FORMDATA_KEY,
} from 'files/utils/file.constant';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @ApiConsumes(MULTIPART_FORMDATA_KEY)
  @ApiBody({ type: CreatePropertyDto })
  @UseInterceptors(
    FilesInterceptor('files', MaxFileCount.PROPERTY_IMAGES),
    BodyInterceptor,
  )
  @Post()
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    return this.propertiesService.create(createPropertyDto, files);
  }

  @Get()
  findAll(@Query() propertiesQueryDto: PropertiesQueryDto) {
    return this.propertiesService.findAll(propertiesQueryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', MaxFileCount.PROPERTY_IMAGES),
    BodyInterceptor,
  )
  @ApiConsumes(MULTIPART_FORMDATA_KEY)
  @ApiBody({ type: FilesSchema })
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
