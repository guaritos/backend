import { Module } from '@nestjs/common';
import { SupabaseClientProvider } from './supabase.provider';


@Module({
  providers: [SupabaseClientProvider],
  exports: [SupabaseClientProvider],
})
export class SupabaseModule {}
