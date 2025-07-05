import { Test, TestingModule } from '@nestjs/testing';
import { RuleService } from '../rule.service';

describe('RuleLoaderService', () => {
  let service: RuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleService],
    }).compile();

    service = module.get<RuleService>(RuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load rules from YAML file', async () => {
    const rules = await service.loadRules();
    console.log('Loaded rules:', rules);
    expect(rules).toBeDefined();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });
});
