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
    return await this.partidosRepository.crear(crearPartidoDto);
  }

  async obtenerTodos(): Promise<PartidoEntidad[]> {
    return await this.partidosRepository.obtenerTodos();
  }

  async obtenerUno(id: string): Promise<PartidoEntidad> {
    try {
      return await this.partidosRepository.obtenerUno(id);
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }
}
