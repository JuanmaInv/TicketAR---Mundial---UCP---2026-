import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Servicio centralizado de Supabase (Principio DRY + Singleton).
 *
 * Usamos `SupabaseClient` para mantener tipado del SDK
 * sin restricciones de tipo, permitiendo operaciones como .insert(), .select()
 * sobre tablas definidas en la base de datos real.
 *
 * El cast del SDK se conserva para compatibilidad de tipos.
 * conflicto entre los tipos internos de Supabase y las reglas del linter.
 */
@Injectable()
export class SupabaseService {
  private readonly client: ReturnType<typeof createClient>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_KEY');

    this.client = createClient(url, key);
  }

  /**
   * Expone el cliente de Supabase para que los servicios realicen queries.
   * Ejemplo:
   *   const { data } = await this.supabaseService.getClient()
   *     .from('partidos')
   *     .select('*');
   */
  getClient(): SupabaseClient {
    return this.client;
  }
}
