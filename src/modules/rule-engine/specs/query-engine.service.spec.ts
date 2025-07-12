import { Test, TestingModule } from '@nestjs/testing';
import { QueryEngineService } from '../query-engine.service';

describe('QueryEngineService', () => {
  let service: QueryEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryEngineService],
    }).compile();

    service = module.get<QueryEngineService>(QueryEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
