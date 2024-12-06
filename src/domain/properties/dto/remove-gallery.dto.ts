import { ArrayNotEmpty } from 'class-validator';
import { IsEntity } from 'common/decorators/validators/is-entity.decorator';
import { IdDto } from 'common/dto/id.dto';

export class RemoveGalleryDto {
  @ArrayNotEmpty()
  @IsEntity()
  readonly galleryIds: IdDto[];
}
