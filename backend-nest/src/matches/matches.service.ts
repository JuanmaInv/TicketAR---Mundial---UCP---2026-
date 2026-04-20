import { Injectable } from '@nestjs/common';
import { CrearPartidoDto } from './dto/create-match.dto';
import { PartidoEntidad } from './entities/match.entity';

@Injectable()
export class PartidosService {
  private baseDeDatosSimulada: PartidoEntidad[] = [];

  crear(crearPartidoDto: CrearPartidoDto) {
    const nuevoPartido: PartidoEntidad = {
      id: crypto.randomUUID(),
      ...crearPartidoDto,
      estado: 'PROGRAMADO',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    this.baseDeDatosSimulada.push(nuevoPartido);
    return nuevoPartido;
  }

  obtenerTodos() {
    return this.baseDeDatosSimulada;
  }
}
