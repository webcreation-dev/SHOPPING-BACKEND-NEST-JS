import { IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArticleDto } from './create-articles.dto';

export class AddArticlesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleDto)
  articles: CreateArticleDto[];
}
