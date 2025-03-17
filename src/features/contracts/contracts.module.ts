import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { DatabaseModule, QueryingModule } from '@app/common';
import { Contract } from './entities/contract.entity';
import { ContractsRepository } from './repositories/contracts.repository';
import { UsersModule } from '../auth/users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { MomoMtnModule } from 'libs/common/src/momo-mtn';
import { DuesRepository } from './repositories/dues.repository';
import { AnnuitiesRepository } from './repositories/annuities.repository';
import { Due } from './entities/due.entity';
import { Annuity } from './entities/annuity.entity';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Contract, Due, Annuity]),
    QueryingModule,
    UsersModule,
    PropertiesModule,
    MomoMtnModule,
  ],
  controllers: [ContractsController],
  providers: [
    ContractsService,
    ContractsRepository,
    DuesRepository,
    AnnuitiesRepository,
  ],
  exports: [
    ContractsService,
    DuesRepository,
    AnnuitiesRepository,
    ContractsRepository,
  ],
})
export class ContractsModule {}
