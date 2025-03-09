import { Controller, Post } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { ApiExcludeController, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';

@ApiExcludeController()
@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @ApiOperation({ summary: 'TRIGGER DATABASE SEED' })
  @Public()
  @Post()
  seed() {
    return this.seedingService.seed();
  }
}
