import { Test, TestingModule } from '@nestjs/testing';
import { AlertEngineController } from './alert-engine.controller';

describe('AlertEngineController', () => {
  let controller: AlertEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertEngineController],
    }).compile();

    controller = module.get<AlertEngineController>(AlertEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
