import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WaitlistsService } from './waitlists.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { HeaderOperation, ApiPaginatedResponse } from '@app/common';
import { WaitlistsQueryDto } from './querying/waitlists-query.dto';
import { Waitlist } from './entities/waitlist.entity';

@Controller('waitlists')
export class WaitlistsController {
  constructor(private readonly waitlistsService: WaitlistsService) {}

  @Post()
  @HeaderOperation('CREATE ', CreateWaitlistDto, null, true)
  create(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistsService.create(createWaitlistDto);
  }

  @Get()
  @ApiPaginatedResponse(Waitlist)
  @HeaderOperation('GET OWN', WaitlistsQueryDto)
  findAll(@Query() waitlistsQueryDto: WaitlistsQueryDto) {
    return this.waitlistsService.findAll(waitlistsQueryDto);
  }
}
