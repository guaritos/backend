import { Test, TestingModule } from '@nestjs/testing';
import { RuleSchedulerService } from '../rule-scheduler.service';

describe('RuleSchedulerService', () => {
  let service: RuleSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleSchedulerService],
    }).compile();

    service = module.get<RuleSchedulerService>(RuleSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
