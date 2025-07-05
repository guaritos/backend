import { Module } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { RuleService } from './rule.service';
import { RuleActionService } from './rule-action.service';
import { RuleSchedulerService } from './rule-scheduler.service';
import { QueryEngineService } from './query-engine.service';

@Module({
  providers: [RuleEngineService, RuleService, RuleActionService, RuleSchedulerService, QueryEngineService]
})
export class RuleEngineModule {}
