import { CrearPartidoDto } from '../dto/create-match.dto';
import { PartidoEntidad } from '../entities/match.entity';

export interface IPartidosRepository {
  crear(partido: CrearPartidoDto): Promise<PartidoEntidad>;
  obtenerTodos(): Promise<PartidoEntidad[]>;
  obtenerUno(id: string): Promise<PartidoEntidad | null>;
}
