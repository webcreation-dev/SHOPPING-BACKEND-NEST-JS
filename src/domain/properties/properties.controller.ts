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
import { FilesSchema } from 'files/swagger/schemas/files.schema';
import { Role } from 'auth/roles/enums/role.enum';
import { Roles } from 'auth/decorators/roles.decorator';
import { Public } from 'auth/decorators/public.decorator';
import { IdDto } from 'common/dto/id.dto';
import { CurrentUser } from 'auth/decorators/user.decorator';
import { User } from 'users/entities/user.entity';
import { RemoveGalleryDto } from './dto/remove-gallery.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Roles(Role.MANAGER)
  @Post()
  @MultipartFormData(CreatePropertyDto, MaxFileCount.PROPERTY_IMAGES)
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() user: User,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    console.log(files, createPropertyDto);
    return this.propertiesService.create(createPropertyDto, files, user);
  }

  @Public()
  @Get()
  findAll(@Query() propertiesQueryDto: PropertiesQueryDto) {
    return this.propertiesService.findAll(propertiesQueryDto);
  }

  @Get(':id')
  async findOne(@Param() { id }: IdDto) {
    console.log(id);
    return this.propertiesService.findOne(id);
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  update(@Param() { id }: IdDto, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Roles(Role.MANAGER)
  @Patch(':id/images')
  @MultipartFormData(FilesSchema, MaxFileCount.PROPERTY_IMAGES)
  addGallery(
    @Param() { id }: IdDto,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    return this.propertiesService.addGallery(id, files);
  }

  @Roles(Role.MANAGER)
  @Delete(':id/images')
  removeGallery(
    @Param() { id }: IdDto,
    @Body() removeGalleryDto: RemoveGalleryDto,
  ) {
    return this.propertiesService.removeGallery(id, removeGalleryDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param() { id }: IdDto) {
    return this.propertiesService.remove(id);
  }

  @Get('user/properties')
  findPropertiesByUser(@CurrentUser() user: User) {
    return this.propertiesService.findPropertiesByUser(user);
  }

  @Post('wishlist/:id')
  toggleWishlist(@CurrentUser() user: User, @Param() { id }: IdDto) {
    return this.propertiesService.toggleWishlist(user, id);
  }

  @Get('user/wishlist')
  getWishlist(@CurrentUser() user: User) {
    return this.propertiesService.getUserWishlist(user);
  }
}
