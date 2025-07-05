import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { SupabaseModule } from './modules/supabase/supabase.module';

@Module({
  imports: [RuleEngineModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
