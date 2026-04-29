import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';
import type { ISectoresRepository } from './repositories/sectores.repository.interface';

@Injectable()
export class SectoresService {
  constructor(
    @Inject('ISectoresRepository')
    private readonly sectoresRepository: ISectoresRepository,
  ) {}

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
    }
  }
}
