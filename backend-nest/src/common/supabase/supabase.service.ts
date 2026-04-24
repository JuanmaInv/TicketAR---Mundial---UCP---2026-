import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Servicio centralizado de Supabase (Principio DRY + Singleton).
 *
 * Usamos `SupabaseClient<any>` para que el cliente acepte cualquier tabla
 * sin restricciones de tipo, permitiendo operaciones como .insert(), .select()
 * sobre tablas definidas en la base de datos real.
 *
 * El cast `as unknown as SupabaseClient<any>` es necesario para evitar el
 * conflicto entre los tipos internos de Supabase y las reglas del linter.
 */
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient<any>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_KEY');

    // `as unknown as SupabaseClient<any>` resuelve el conflicto de tipos del linter
    // sin perder la funcionalidad real del cliente de Supabase.
    this.client = createClient(url, key) as unknown as SupabaseClient<any>;
  }

  /**
   * Expone el cliente de Supabase para que los servicios realicen queries.
   * Ejemplo:
   *   const { data } = await this.supabaseService.getClient()
   *     .from('partidos')
   *     .select('*');
   */
  getClient(): SupabaseClient<any> {
    return this.client;
  }
}