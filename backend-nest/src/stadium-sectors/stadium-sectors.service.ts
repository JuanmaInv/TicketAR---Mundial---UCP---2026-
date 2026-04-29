<<<<<<< Updated upstream
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';
import type { ISectoresRepository } from './repositories/sectores.repository.interface';
=======
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';
import type { ISectoresRepository } from './repositories/stadium-sectors.repository.interface';
import { SectorEstadioEntidad } from './entities/stadium-sector.entity';
>>>>>>> Stashed changes

@Injectable()
export class SectoresService {
  constructor(
    @Inject('ISectoresRepository')
    private readonly sectoresRepository: ISectoresRepository,
  ) {}

<<<<<<< Updated upstream
  async obtenerTodos() {
    return this.sectoresRepository.obtenerTodos();
  }

  async obtenerUno(id: string) {
    const sector = await this.sectoresRepository.obtenerUno(id);
    if (!sector) {
      throw new NotFoundException('Sector de estadio no encontrado');
    }
    return sector;
  }

  async crear(dto: CrearSectorDto) {
    try {
      return await this.sectoresRepository.crear(dto);
    } catch (error) {
      throw new Error('Error al crear el sector: ' + error.message);
=======
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
>>>>>>> Stashed changes
    }
  }
}
