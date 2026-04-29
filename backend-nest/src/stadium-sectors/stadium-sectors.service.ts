import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';
import type { ISectoresRepository } from './repositories/stadium-sectors.repository.interface';
import { SectorEstadioEntidad } from './entities/stadium-sector.entity';

@Injectable()
export class SectoresService {
  constructor(
    @Inject('ISectoresRepository')
    private readonly sectoresRepository: ISectoresRepository,
  ) {}

  async crear(crearSectorDto: CrearSectorDto): Promise<SectorEstadioEntidad> {
    try {
      return await this.sectoresRepository.crear(crearSectorDto);
    } catch (error) {
      throw new Error('Error al crear el sector: ' + error.message);
    }
  }

  async obtenerTodos(): Promise<SectorEstadioEntidad[]> {
    return await this.sectoresRepository.obtenerTodos();
  }

  async obtenerUno(id: string): Promise<SectorEstadioEntidad> {
    try {
      const sector = await this.sectoresRepository.obtenerUno(id);
      if (!sector) {
        throw new NotFoundException('Sector de estadio no encontrado');
      }
      return sector;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException(error.message);
    }
  }
}
