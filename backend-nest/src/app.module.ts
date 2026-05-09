import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EntradasModule } from './tickets/tickets.module';
import { PagosModule } from './payments/payments.module';
import { CredencialesPasaporteModule } from './passport-credentials/passport-credentials.module';
import { SectoresModule } from './stadium-sectors/stadium-sectors.module';
import { PartidosModule } from './matches/matches.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    // Carga las variables del .env y las hace disponibles via ConfigService
    ConfigModule.forRoot({ isGlobal: true }),
    // Habilita el scheduling para los Cron Jobs
    ScheduleModule.forRoot(),
    // Motor de eventos (Patrón Observer) para comunicación desacoplada entre módulos
    EventEmitterModule.forRoot(),
    // Cliente de Supabase disponible en toda la app (marcado @Global)
    SupabaseModule,
    UsuariosModule,
    PartidosModule,
    SectoresModule,
    EntradasModule,
    PagosModule,
    CredencialesPasaporteModule,
    // Módulo de notificaciones (envío de QR por email tras pago)
    NotificationsModule,
    StatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
