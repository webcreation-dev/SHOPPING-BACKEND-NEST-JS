import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';
import { IntersectionType } from '@nestjs/swagger';
import { FilesSchema } from 'files/swagger/schemas/files.schema';

export class UpdatePropertyDto extends IntersectionType(
  PartialType(CreatePropertyDto),
  FilesSchema,
) {}
