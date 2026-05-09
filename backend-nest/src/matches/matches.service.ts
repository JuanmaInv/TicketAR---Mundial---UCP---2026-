import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CrearPartidoDto } from './dto/create-match.dto';
import { ActualizarPartidoDto } from './dto/update-match.dto';
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

  /**
   * Actualiza un partido existente.
   * Valida que el partido exista antes de intentar la actualización.
   */
  async actualizar(
    id: string,
    datos: ActualizarPartidoDto,
  ): Promise<PartidoEntidad> {
    try {
      return await this.partidosRepository.actualizar(id, datos);
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }

  /**
   * Elimina un partido por su ID.
   * La DB se encarga de eliminar en cascada los registros de partido_sectores.
   */
  async eliminar(id: string): Promise<void> {
    // Verificamos que el partido exista antes de eliminarlo
    await this.obtenerUno(id);

    try {
      await this.partidosRepository.eliminar(id);
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }
}
