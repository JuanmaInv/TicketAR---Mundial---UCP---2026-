import { Injectable, Inject } from '@nestjs/common';
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

  async actualizar(email: string, datos: any): Promise<UsuarioEntidad> {
    return this.usuariosRepository.actualizar(email, datos);
  }

  async obtenerTodos(): Promise<UsuarioEntidad[]> {
    return this.usuariosRepository.obtenerTodos();
  }
}
