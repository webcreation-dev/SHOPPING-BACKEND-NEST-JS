import { ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArticleDto } from './create-articles.dto';

export class UpdateArticleDto {
  @ValidateNested()
  @Type(() => CreateArticleDto)
  article: CreateArticleDto;

  @IsNumber()
  @IsNotEmpty()
  article_id: number;
}
