import { forwardRef, Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { DatabaseModule, FilesModule, QueryingModule } from '@app/common';
import { Property } from './entities/property.entity';
import { PropertiesRepository } from './properties.repository';
import { GalleriesModule } from './galleries.module';
import { UsersModule } from '../auth/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Property]),
    FilesModule,
    QueryingModule,
    GalleriesModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesRepository],
  exports: [PropertiesService, PropertiesRepository],
})
export class PropertiesModule {}
