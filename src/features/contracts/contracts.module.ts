import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { DatabaseModule, QueryingModule } from '@app/common';
import { Contract } from './entities/contract.entity';
import { ContractsRepository } from './contracts.repository';
import { UsersModule } from '../auth/users/users.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Contract]),
    QueryingModule,
    UsersModule,
    PropertiesModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService, ContractsRepository],
})
export class ContractsModule {}
