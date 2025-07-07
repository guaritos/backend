import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { EmailModule } from './modules/email/email.module';
import { AlertEngineModule } from './modules/alert-engine/alert-engine.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [RuleEngineModule, SupabaseModule, EmailModule, AlertEngineModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
