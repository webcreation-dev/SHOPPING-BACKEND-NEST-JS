import { Module } from '@nestjs/common';
import { GalleriesRepository } from './galleries.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity'; // Assure-toi que la bonne entité est importée

@Module({
  imports: [TypeOrmModule.forFeature([Gallery])],
  providers: [GalleriesRepository],
  exports: [GalleriesRepository],
})
export class GalleriesModule {}
