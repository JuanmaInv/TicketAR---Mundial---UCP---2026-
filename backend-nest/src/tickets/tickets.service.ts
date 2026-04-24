import { Injectable, ConflictException } from '@nestjs/common';
import { CrearEntradaDto } from './dto/create-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class EntradasService {
  private baseDeDatosSimulada: TicketEntity[] = [];

  crear(crearEntradaDto: CrearEntradaDto) {
    // 🚨 Regla Crítica: Máximo 1 entrada por sesión por usuario
    const entradaActiva = this.baseDeDatosSimulada.find(
      (entrada) =>
        entrada.userId === crearEntradaDto.idUsuario &&
        (entrada.status === TicketStatus.RESERVED ||
          entrada.status === TicketStatus.PAID),
    );

    if (entradaActiva) {
      throw new ConflictException(
        'El usuario ya tiene una entrada activa o en reserva.',
      );
    }

    // 🚨 Reserva: El servidor bloquea el lugar por 15 minutos
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 15);

    const nuevaEntrada: TicketEntity = {
      id: crypto.randomUUID(),
      userId: crearEntradaDto.idUsuario,
      sectorId: crearEntradaDto.idSector,
      status: TicketStatus.RESERVED,
      reservationExpiresAt: expiracion,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.baseDeDatosSimulada.push(nuevaEntrada);
    return nuevaEntrada;
  }

  obtenerTodas() {
    return this.baseDeDatosSimulada;
  }

  obtenerUna(id: string) {
    return this.baseDeDatosSimulada.find((entrada) => entrada.id === id);
  }

  marcarComoPagada(id: string) {
    const entrada = this.obtenerUna(id);
    if (entrada) {
      entrada.status = TicketStatus.PAID;
      entrada.updatedAt = new Date();
    }
    return entrada;
  }
}
