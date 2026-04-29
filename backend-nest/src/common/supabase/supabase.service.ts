import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient<any>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_KEY');
    this.client = createClient(url, key) as unknown as SupabaseClient<any>;
  }

  getClient(): SupabaseClient<any> {
    return this.client;
  }
}
