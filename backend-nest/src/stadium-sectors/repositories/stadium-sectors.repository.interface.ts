import { SectorEstadioEntidad } from '../entities/stadium-sector.entity';
import { CrearSectorDto } from '../dto/create-stadium-sector.dto';

/**
 * Sector disponible por partido — incluye stock de partido_sectores.
 */
export interface SectorPorPartido {
  id: string; // ID del partido_sectores
  idSector: string; // ID del sector en sectores_estadio
  nombre: string; // Nombre del sector (ej: POPULAR)
  precio: number; // Precio del sector desde sectores_estadio
  asientosDisponibles: number; // Stock real desde partido_sectores
}

export interface ISectoresRepository {
  crear(sector: CrearSectorDto): Promise<SectorEstadioEntidad>;
  obtenerTodos(): Promise<SectorEstadioEntidad[]>;
  obtenerUno(id: string): Promise<SectorEstadioEntidad>;
  /**
   * Retorna los sectores disponibles para un partido con su stock real.
   * Hace join entre partido_sectores y sectores_estadio.
   */
  obtenerSectoresPorPartido(idPartido: string): Promise<SectorPorPartido[]>;
  /**
   * Retorna los sectores de todos los partidos para poder calcular el precio mínimo.
   */
  obtenerSectoresTodosLosPartidos(): Promise<{ idPartido: string; sectores: SectorPorPartido[] }[]>;
}
