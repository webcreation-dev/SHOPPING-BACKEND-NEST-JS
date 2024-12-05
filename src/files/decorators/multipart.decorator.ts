import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BodyInterceptor } from '../interceptors/body/body.interceptor';
import {
  MaxFileCount,
  MULTIPART_FORMDATA_KEY,
} from 'files/utils/file.constant';

export function MultipartFormData(
  dto: any,
  maxFileCount: number = MaxFileCount.PRODUCT_IMAGES,
) {
  return applyDecorators(
    ApiConsumes(MULTIPART_FORMDATA_KEY),
    ApiBody({ type: dto }),
    UseInterceptors(FilesInterceptor('files', maxFileCount), BodyInterceptor),
  );
}
