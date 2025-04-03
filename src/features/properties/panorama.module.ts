import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Panorama } from './entities/panorama.entity';
import { PanoramaRepository } from './panorama.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Panorama])],
  providers: [PanoramaRepository],
  exports: [PanoramaRepository],
})
export class PanoramaModule {}
