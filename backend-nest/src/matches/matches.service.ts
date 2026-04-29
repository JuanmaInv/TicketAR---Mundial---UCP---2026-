import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CrearPartidoDto } from './dto/create-match.dto';
import type { IPartidosRepository } from './repositories/matches.repository.interface';
import { PartidoEntidad } from './entities/match.entity';

@Injectable()
export class PartidosService {
  constructor(
    @Inject('IPartidosRepository')
    private readonly partidosRepository: IPartidosRepository,
  ) {}

  async crear(crearPartidoDto: CrearPartidoDto): Promise<PartidoEntidad> {
    return this.partidosRepository.crear(crearPartidoDto);
  }

  async obtenerTodos(): Promise<PartidoEntidad[]> {
    return this.partidosRepository.obtenerTodos();
  }

  async obtenerUno(id: string): Promise<PartidoEntidad> {
    const partido = await this.partidosRepository.obtenerUno(id);
    if (!partido) {
      throw new NotFoundException(`Partido con ID ${id} no encontrado`);
    }
    return partido;
  }
}
