import { Module } from '@nestjs/common';
import { AlertEngineService } from './alert-engine.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AlertEngineController } from './alert-engine.controller';

@Module({
    imports: [SupabaseModule],
    providers: [AlertEngineService],
    exports: [AlertEngineService],
    controllers: [AlertEngineController],
})
export class AlertEngineModule {}
