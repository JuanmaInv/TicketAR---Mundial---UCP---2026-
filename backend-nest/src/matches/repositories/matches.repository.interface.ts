import { PartidoEntidad } from '../entities/match.entity';
import { CrearPartidoDto } from '../dto/create-match.dto';

export interface IPartidosRepository {
  crear(partido: CrearPartidoDto): Promise<PartidoEntidad>;
  obtenerTodos(): Promise<PartidoEntidad[]>;
  obtenerUno(id: string): Promise<PartidoEntidad>;
  actualizarEstado(id: string, estado: string): Promise<void>;
}
