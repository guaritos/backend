import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

config();

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co',
  service_key: process.env.SUPABASE_SERVICE_KEY || 'your-supabase-service-key',
}));
