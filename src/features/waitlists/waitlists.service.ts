import { Injectable } from '@nestjs/common';
import { WaitlistsRepository } from './waitlists.repository';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';
import { WaitlistsQueryDto } from './querying/waitlists-query.dto';
import { DefaultPageSize, PaginationService } from '@app/common';
import { WaitlistResource } from './resources/waitlist.resource';

@Injectable()
export class WaitlistsService {
  constructor(
    private readonly waitlistsRepository: WaitlistsRepository,
    private readonly paginationService: PaginationService,
    private readonly waitlistResource: WaitlistResource,
  ) {}

  async findAll(waitlistsQueryDto: WaitlistsQueryDto) {
    const { page } = waitlistsQueryDto;
    const limit = waitlistsQueryDto.limit ?? DefaultPageSize.WAITLIST;
    const offset = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.waitlistsRepository.findAndCount(
      {},
      {
        relations: {},
        skip: offset,
        take: limit,
      },
    );

    const meta = this.paginationService.createMeta(limit, page, count);
    return { data: this.waitlistResource.formatCollection(data), meta };
  }

  async create(createWaitlistDto: CreateWaitlistDto) {
    const waitlist = await this.waitlistsRepository.create(
      new Waitlist(createWaitlistDto),
    );

    return await this.findOne(waitlist.id);
  }

  async findOne(id: number) {
    const waitlist = await this.waitlistsRepository.findOne({ id }, {});
    return this.waitlistResource.format(waitlist);
  }
}
