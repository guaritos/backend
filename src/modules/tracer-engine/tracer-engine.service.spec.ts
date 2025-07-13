import { Test, TestingModule } from '@nestjs/testing';
import { TracerEngineService } from './tracer-engine.service';

describe('TracerEngineService', () => {
  let service: TracerEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TracerEngineService],
    }).compile();

    service = module.get<TracerEngineService>(TracerEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
