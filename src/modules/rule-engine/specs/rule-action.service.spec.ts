import { Test, TestingModule } from '@nestjs/testing';
import { RuleActionService } from '../rule-action.service';

describe('RuleActionService', () => {
  let service: RuleActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleActionService],
    }).compile();

    service = module.get<RuleActionService>(RuleActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
