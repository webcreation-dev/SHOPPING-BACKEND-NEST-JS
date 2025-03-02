import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MomoMtnService } from './momo-mtn.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MomoMtnService],
  controllers: [],
  exports: [MomoMtnService],
})
export class MomoMtnModule {}
