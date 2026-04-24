import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EntradasModule } from './tickets/tickets.module';
import { PagosModule } from './payments/payments.module';
import { CredencialesPasaporteModule } from './passport-credentials/passport-credentials.module';
import { SectoresModule } from './stadium-sectors/stadium-sectors.module';
import { PartidosModule } from './matches/matches.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
  imports: [
    // Carga las variables del .env y las hace disponibles via ConfigService
    ConfigModule.forRoot({ isGlobal: true }),
    // Cliente de Supabase disponible en toda la app (marcado @Global)
    SupabaseModule,
    UsuariosModule,
    PartidosModule,
    SectoresModule,
    EntradasModule,
    PagosModule,
    CredencialesPasaporteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
