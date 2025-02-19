import { ApiFileProperty } from '../decorators/api-file-property.decorator';
import { Express } from 'express';

export class FileSchema {
  @ApiFileProperty()
  file: Express.Multer.File;
}
