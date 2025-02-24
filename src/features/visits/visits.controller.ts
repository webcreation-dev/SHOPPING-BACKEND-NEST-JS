import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import {
  IdDto,
  CurrentUser,
  HeaderOperation,
  ApiPaginatedResponse,
} from '@app/common';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { User } from '../auth/users/entities/user.entity';
import { VisitsQueryDto } from './querying/visits-query.dto';
import { Visit } from './entities/visit.entity';
import { FinalizeVisitDto } from './dto/finalize-visit.dto';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @HeaderOperation('CREATE ', CreateVisitDto)
  create(@Body() createVisitDto: CreateVisitDto, @CurrentUser() user: User) {
    return this.visitsService.create(createVisitDto, user);
  }

  @Get()
  @ApiPaginatedResponse(Visit)
  @HeaderOperation('GET OWN', VisitsQueryDto)
  findAll(@Query() visitsQueryDto: VisitsQueryDto, @CurrentUser() user: User) {
    return this.visitsService.findAll(visitsQueryDto, user);
  }

  @Get('/managed')
  @ApiPaginatedResponse(Visit)
  @HeaderOperation('GET MANAGED', VisitsQueryDto)
  findManaged(
    @Query() visitsQueryDto: VisitsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.visitsService.findManaged(visitsQueryDto, user);
  }

  @Get(':id')
  @HeaderOperation('GET ONE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.findOne(id);
  }

  @Patch(':id')
  @HeaderOperation('UPDATE ', UpdateVisitDto)
  update(@Param() { id }: IdDto, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitsService.update(id, updateVisitDto);
  }

  @Patch(':id/finalize')
  @HeaderOperation('FINALIZE ', FinalizeVisitDto)
  finalize(@Param() { id }: IdDto, @Body() finalizeVisitDto: FinalizeVisitDto) {
    return this.visitsService.finalize(id, finalizeVisitDto);
  }

  @Delete(':id')
  @HeaderOperation('DELETE')
  async remove(@Param() { id }: IdDto) {
    return this.visitsService.remove(id);
  }
}
