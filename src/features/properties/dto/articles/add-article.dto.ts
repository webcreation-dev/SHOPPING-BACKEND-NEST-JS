import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArticleDto } from './create-articles.dto';
import { IsExist } from '@app/common';
import { User } from 'src/features/auth/users/entities/user.entity';

export class AddArticlesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleDto)
  articles: CreateArticleDto[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsExist(User, 'code')
  owner_code?: string;

  owner?: User;
}
