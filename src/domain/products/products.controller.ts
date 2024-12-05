import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IdDto } from 'common/dto/id.dto';
import { Public } from 'auth/decorators/public.decorator';
import { Role } from 'auth/roles/enums/role.enum';
import { Roles } from 'auth/decorators/roles.decorator';
import { createParseFilePipe } from 'files/utils/file-validation.util';
import {
  MaxFileCount,
  MULTIPART_FORMDATA_KEY,
} from 'files/utils/file.constant';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IdFilenameDto } from 'files/dto/id-filename.dto';
import { ApiBody, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { FilesSchema } from 'files/swagger/schemas/files.schema';
import { FileSchema } from 'files/swagger/schemas/file.schema';
import { BodyInterceptor } from 'files/interceptors/body/body.interceptor';
import { ProductsQueryDto } from './dto/querying/products-query.dto';
import { CreatePropertyDto } from 'properties/dto/create-property.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

// @ApiExcludeEndpoint()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.MANAGER)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  findAll(@Query() productsQueryDto: ProductsQueryDto) {
    return this.productsService.findAll(productsQueryDto);
  }

  @Public()
  @Get(':id')
  findOne(@Param() { id }: IdDto) {
    return this.productsService.findOne(id);
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  update(@Param() { id }: IdDto, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(Role.MANAGER)
  @Delete(':id')
  remove(@Param() { id }: IdDto) {
    return this.productsService.remove(id);
  }

  @ApiConsumes(MULTIPART_FORMDATA_KEY)
  @ApiBody({ type: CreatePropertyDto })
  @Roles(Role.MANAGER)
  @UseInterceptors(
    FilesInterceptor('files', MaxFileCount.PRODUCT_IMAGES),
    BodyInterceptor,
  )
  @Post(':id/images')
  uploadImages(
    @Param() { id }: IdDto,
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    console.log(files, createPropertyDto);
    return;
  }

  @Post(':id/upload')
  @ApiConsumes('multipart/form-data') // Documentation Swagger pour multipart
  @ApiBody({ type: CreatePropertyDto }) // Associe le DTO pour Swagger
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 fichiers
  uploadProperty(
    @Param('id') id: string,
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[], // Les fichiers reçus
  ) {
    // // Vous pouvez maintenant traiter les fichiers et les données
    // if (!files || files.length === 0) {
    //   throw new BadRequestException('No files uploaded!');
    // }

    console.log('Files:', files);
    console.log('Data:', createPropertyDto);

    return {
      message: 'Files and data received successfully',
      data: createPropertyDto,
      files: files.map((file) => ({
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      })),
    };
  }
  @Public()
  @Get(':id/images/:filename')
  downloadImage(@Param() { id, filename }: IdFilenameDto) {
    return this.productsService.downloadImage(id, filename);
  }

  @Roles(Role.MANAGER)
  @ApiOkResponse({ type: FileSchema })
  @Delete(':id/images/:filename')
  deleteImage(@Param() { id, filename }: IdFilenameDto) {
    return this.productsService.deleteImage(id, filename);
  }
}
