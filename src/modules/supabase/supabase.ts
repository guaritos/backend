import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class Supabase {
    constructor(
        private readonly supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY)
    ) {}

    getClient() {
        return this.supabase;
    }
}
