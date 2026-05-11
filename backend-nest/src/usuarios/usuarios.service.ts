import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuarioEntidad } from './entities/usuario.entidad';
import type { IUsuariosRepository } from './repositories/usuarios.repository.interface';

//REPOSITORY USANDO INTERFAZ
@Injectable()
export class UsuariosService {
  constructor(
    @Inject('IUsuariosRepository')
    private readonly usuariosRepository: IUsuariosRepository,
  ) {}

  async crear(crearUsuarioDto: CrearUsuarioDto): Promise<UsuarioEntidad> {
    // Aquí podrías agregar lógica de negocio antes de guardar
    // Ej: verificar si el usuario es mayor de edad o si el pasaporte tiene formato correcto
    return this.usuariosRepository.crear(crearUsuarioDto);
  }

  async buscarPorEmail(email: string): Promise<UsuarioEntidad | null> {
    return this.usuariosRepository.buscarPorEmail(email);
  }

  async buscarPorId(id: string): Promise<UsuarioEntidad | null> {
    return this.usuariosRepository.buscarPorId(id);
  }

  async actualizar(
    email: string,
    datos: Partial<CrearUsuarioDto>,
  ): Promise<UsuarioEntidad> {
    return this.usuariosRepository.actualizar(email, datos);
  }

  async obtenerTodos(): Promise<UsuarioEntidad[]> {
    return this.usuariosRepository.obtenerTodos();
  }

  /**
   * Elimina la cuenta del usuario y todos sus registros asociados.
   * La DB maneja la cascada (entradas, reservas) vía ON DELETE CASCADE.
   * Cumple con el "Derecho al Olvido".
   */
  async eliminar(id: string): Promise<void> {
    const usuario = await this.usuariosRepository.buscarPorId(id);

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    try {
      await this.usuariosRepository.eliminar(id);
    } catch (error) {
      const detalle =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        `No se pudo eliminar la cuenta en este momento. ${detalle}`,
      );
    }
  }
}
