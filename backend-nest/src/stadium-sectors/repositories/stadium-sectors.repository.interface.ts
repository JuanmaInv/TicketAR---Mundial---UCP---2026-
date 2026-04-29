import { SectorEstadioEntidad } from '../entities/stadium-sector.entity';
import { CrearSectorDto } from '../dto/create-stadium-sector.dto';

export interface ISectoresRepository {
  crear(sector: CrearSectorDto): Promise<SectorEstadioEntidad>;
  obtenerTodos(): Promise<SectorEstadioEntidad[]>;
  obtenerUno(id: string): Promise<SectorEstadioEntidad>;
}
