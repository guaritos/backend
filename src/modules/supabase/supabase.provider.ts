import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const SupabaseClientProvider = {
  provide: 'supabaseClient',
  useFactory: (configService: ConfigService) => {
    const url = configService.get<string>('supabase.url');
    const key = configService.get<string>('supabase.service_key');
    if (!url || !key) {
      throw new Error('Supabase URL and Service Key must be provided');
    }
    return createClient(url, key);
  },
  inject: [ConfigService],
};