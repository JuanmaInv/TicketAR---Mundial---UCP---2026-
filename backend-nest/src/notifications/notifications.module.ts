import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { EntradasModule } from '../tickets/tickets.module';

/**
 * Módulo de Notificaciones.
 *
 * Importa UsuariosModule para poder buscar el email del usuario.
 * Importa EntradasModule para usar el QrService (exportado como singleton).
 */
@Module({
  imports: [UsuariosModule, EntradasModule],
  providers: [
    NotificationsService,
  ],
})
export class NotificationsModule {}
