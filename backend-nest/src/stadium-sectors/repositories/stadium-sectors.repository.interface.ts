import { SectorEstadioEntidad } from '../entities/stadium-sector.entity';
import { CrearSectorDto } from '../dto/create-stadium-sector.dto';
import { ActualizarSectorEnPartidoDto } from '../dto/update-sector-in-match.dto';

export interface ISectoresRepository {
  crear(sector: CrearSectorDto): Promise<SectorEstadioEntidad>;
  obtenerTodos(): Promise<SectorEstadioEntidad[]>;
  obtenerUno(id: string): Promise<SectorEstadioEntidad>;
  obtenerPorPartido(idPartido: string): Promise<SectorEstadioEntidad[]>;
  actualizarEnPartido(
    idPartido: string,
    idSector: string,
    datos: ActualizarSectorEnPartidoDto,
  ): Promise<SectorEstadioEntidad>;
}
