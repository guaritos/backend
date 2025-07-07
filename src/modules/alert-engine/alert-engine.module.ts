import { Module } from '@nestjs/common';
import { AlertEngineService } from './alert-engine.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    providers: [AlertEngineService],
    exports: [AlertEngineService],
})
export class AlertEngineModule {}
