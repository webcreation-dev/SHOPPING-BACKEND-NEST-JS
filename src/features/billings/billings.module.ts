import { Module } from '@nestjs/common';
import { BillingsController } from './billings.controller';
import { BillingsService } from './billings.service';
import { DatabaseModule } from '@app/common';
import { MomoMtnModule } from 'libs/common/src/momo-mtn';
import { Contract } from '../contracts/entities/contract.entity';
import { Due } from '../contracts/entities/due.entity';
import { Annuity } from '../contracts/entities/annuity.entity';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Contract, Due, Annuity]),
    ContractsModule,
    MomoMtnModule,
  ],
  controllers: [BillingsController],
  providers: [BillingsService],
})
export class BillingsModule {}
