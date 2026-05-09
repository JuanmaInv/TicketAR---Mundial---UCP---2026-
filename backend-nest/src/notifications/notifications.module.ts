import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { QrService } from '../tickets/qr.service';

/**
 * Módulo de Notificaciones.
 *
 * Importa UsuariosModule para poder buscar el email del usuario.
 * Registra el QrService directamente ya que solo necesita ese servicio
 * del módulo de tickets (evita dependencia circular).
 */
@Module({
  imports: [UsuariosModule],
  providers: [
    NotificationsService,
    // Se registra QrService aquí directamente para evitar importar todo EntradasModule
    QrService,
  ],
})
export class NotificationsModule {}
