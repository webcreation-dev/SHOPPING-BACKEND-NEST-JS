import { IsNumber, IsNotEmpty } from 'class-validator';

export class RemoveArticleDto {
  @IsNumber()
  @IsNotEmpty()
  article_id: number;
}
