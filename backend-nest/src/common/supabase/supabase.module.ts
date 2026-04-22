import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Módulo global de Supabase.
 * Al marcarlo como @Global(), el SupabaseService queda disponible en
 * toda la aplicación sin necesidad de importar este módulo en cada
 * módulo de negocio (UsuariosModule, EntradasModule, PagosModule, etc.).
 * Solo se registra una vez en AppModule y se distribuye automáticamente.
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
