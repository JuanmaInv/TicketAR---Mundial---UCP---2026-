import { CrearSectorDto } from '../dto/create-stadium-sector.dto';

export interface ISectoresRepository {
  obtenerTodos(): Promise<any[]>;
  obtenerUno(id: string): Promise<any | null>;
  crear(dto: CrearSectorDto): Promise<any>;
}
