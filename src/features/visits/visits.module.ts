import { Module } from '@nestjs/common';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { DatabaseModule, QueryingModule } from '@app/common';
import { Visit } from './entities/visit.entity';
import { VisitsRepository } from './visits.repository';
import { UsersModule } from '../auth/users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { VisitResource } from './resources/visit.resource';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Visit]),
    QueryingModule,
    UsersModule,
    PropertiesModule,
  ],
  controllers: [VisitsController],
  providers: [VisitsService, VisitsRepository, VisitResource],
})
export class VisitsModule {}
