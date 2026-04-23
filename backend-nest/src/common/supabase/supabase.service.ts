import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * Servicio centralizado de Supabase (Principio DRY + Singleton).
 * Al tener un único cliente compartido, evitamos múltiples conexiones
 * y centralizamos la configuración de la base de datos en un solo lugar.
 * Cualquier módulo que necesite acceder a Supabase inyecta este servicio.
 */
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_KEY');

    this.client = createClient<Database>(url, key);
  }

  /**
   * Expone el cliente de Supabase para que los servicios realicen queries.
   * Ejemplo de uso en un servicio:
   *   const { data, error } = await this.supabaseService.getClient()
   *     .from('entradas')
   *     .select('*');
   */
  getClient(): SupabaseClient<Database> {
    return this.client;
  }
}
