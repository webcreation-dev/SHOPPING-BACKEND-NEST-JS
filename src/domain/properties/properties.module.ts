import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { Location } from './entities/location.entity';
import { Gallery } from './entities/gallery.entity';
import { FilesModule } from 'files/files.module';
import { UsersModule } from 'users/users.module';
import { QueryingModule } from 'querying/querying.module';
import { User } from 'users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, Location, Gallery, User]),
    FilesModule,
    QueryingModule,
    UsersModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
