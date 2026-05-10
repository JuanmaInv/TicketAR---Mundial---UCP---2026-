import { PartidoEntidad } from '../entities/match.entity';
import { CrearPartidoDto } from '../dto/create-match.dto';
import { ActualizarPartidoDto } from '../dto/update-match.dto';

export interface IPartidosRepository {
  crear(partido: CrearPartidoDto): Promise<PartidoEntidad>;
  obtenerTodos(): Promise<PartidoEntidad[]>;
  obtenerUno(id: string): Promise<PartidoEntidad>;
  actualizarEstado(id: string, estado: string): Promise<void>;
  actualizar(id: string, datos: ActualizarPartidoDto): Promise<PartidoEntidad>;
  eliminar(id: string): Promise<void>;
}
