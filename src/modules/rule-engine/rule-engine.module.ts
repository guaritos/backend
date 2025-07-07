import { Module } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { RuleService } from './rule.service';
import { RuleActionService } from './rule-action.service';
import { RuleSchedulerService } from './rule-scheduler.service';
import { QueryEngineService } from './query-engine.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { RuleEngineController } from './rule-engine.controller';
import { AlertEngineModule } from '../alert-engine/alert-engine.module';
import { EmailModule } from '../email/email.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [SupabaseModule, AlertEngineModule, EmailModule, EventsModule, ScheduleModule.forRoot()],
  providers: [RuleEngineService, RuleService, RuleActionService, RuleSchedulerService, QueryEngineService],
  controllers: [RuleEngineController]
  
})
export class RuleEngineModule {}
