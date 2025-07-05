import { Module } from '@nestjs/common';
import { Supabase } from './supabase';

@Module({
  providers: [Supabase],
})
export class SupabaseModule {}
