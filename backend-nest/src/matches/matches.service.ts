import { Injectable, Inject } from '@nestjs/common';
import { CrearPartidoDto } from './dto/create-match.dto';
import { PartidoEntidad } from './entities/match.entity';
import type { IPartidosRepository } from './repositories/matches.repository.interface';

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

  async obtenerUno(id: string): Promise<PartidoEntidad | null> {
    return this.partidosRepository.obtenerUno(id);
  }
}
