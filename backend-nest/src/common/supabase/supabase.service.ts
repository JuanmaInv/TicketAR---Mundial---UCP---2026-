import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Servicio centralizado de Supabase (Principio DRY + Singleton).
 *
 * NOTA TÉCNICA: Usamos `any` como genérico del cliente intencionalmente.
 * La librería `supabase-js` v2 requiere un schema muy específico generado
 * con `supabase gen types` para funcionar sin errores de compilación.
 * En esta etapa de desarrollo, `any` nos permite operar sin bloqueos.
 * En producción, reemplazar por los tipos generados automáticamente.
 */
@Injectable()
export class SupabaseService {
  // Cliente tipado como `any` para evitar conflictos internos de Supabase generics
  private readonly client: SupabaseClient<any>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_KEY');

    // Sin genérico explícito para máxima compatibilidad en desarrollo
    this.client = createClient(url, key);
  }

  /**
   * Expone el cliente de Supabase para que los servicios realicen queries.
   * Uso en cualquier servicio inyectando SupabaseService:
   *   const { data } = await this.supabaseService.getClient()
   *     .from('partidos')
   *     .select('*');
   */
  getClient(): SupabaseClient<any> {
    return this.client;
  }
}
