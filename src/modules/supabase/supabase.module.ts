import { Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SupabaseClientProvider = {
  provide: 'supabaseClient',
  useValue: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY),
};

@Module({
  providers: [SupabaseClientProvider],
  exports: [SupabaseClientProvider],
})
export class SupabaseModule {}
