import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [RuleEngineModule, SupabaseModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
