import { Test, TestingModule } from '@nestjs/testing';
import { BestReposService } from './best-repos.service';

describe('BestReposService', () => {
  let service: BestReposService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BestReposService],
    }).compile();

    service = module.get<BestReposService>(BestReposService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
