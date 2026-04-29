import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
    return await this.sectoresRepository.crear(crearSectorDto);
  }

  async obtenerTodos(): Promise<SectorEstadioEntidad[]> {
    return await this.sectoresRepository.obtenerTodos();
  }

  async obtenerUno(id: string): Promise<SectorEstadioEntidad> {
    try {
      return await this.sectoresRepository.obtenerUno(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
