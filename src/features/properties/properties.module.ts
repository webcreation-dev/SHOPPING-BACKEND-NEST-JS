import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { DatabaseModule, FilesModule, QueryingModule } from '@app/common';
import { Property } from './models/property.entity';
import { PropertiesRepository } from './properties.repository';
import { GalleriesModule } from './galleries.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Property]),
    FilesModule,
    QueryingModule,
    GalleriesModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesRepository],
})
export class PropertiesModule {}
