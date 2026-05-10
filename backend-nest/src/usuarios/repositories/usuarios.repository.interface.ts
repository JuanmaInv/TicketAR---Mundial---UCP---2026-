import { UsuarioEntidad } from '../entities/usuario.entidad';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';

export interface IUsuariosRepository {
  crear(usuario: CrearUsuarioDto): Promise<UsuarioEntidad>;
  buscarPorEmail(email: string): Promise<UsuarioEntidad | null>;
  buscarPorId(id: string): Promise<UsuarioEntidad | null>;
  actualizar(
    email: string,
    datos: Partial<CrearUsuarioDto>,
  ): Promise<UsuarioEntidad>;
  obtenerTodos(): Promise<UsuarioEntidad[]>;
  eliminar(id: string): Promise<void>;
}
