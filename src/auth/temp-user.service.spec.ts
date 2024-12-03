import { Test, TestingModule } from '@nestjs/testing';
import { TempUserService } from './temp-user.service';

describe('TempUserService', () => {
  let service: TempUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TempUserService],
    }).compile();

    service = module.get<TempUserService>(TempUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
