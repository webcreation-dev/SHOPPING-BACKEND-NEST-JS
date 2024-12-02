import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryingModule } from 'querying/querying.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), QueryingModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
