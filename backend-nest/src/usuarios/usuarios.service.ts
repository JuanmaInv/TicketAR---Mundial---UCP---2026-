import { Injectable, ConflictException } from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuarioEntidad } from './entities/usuario.entidad';

@Injectable()
export class UsuariosService {
  // Base de datos simulada en memoria (Mock)
  private baseDeDatosSimulada: UsuarioEntidad[] = [];

  crear(crearUsuarioDto: CrearUsuarioDto) {
    // Validar regla de negocio: el pasaporte o email no pueden estar duplicados
    const existe = this.baseDeDatosSimulada.find(
      (usuario) =>
        usuario.numeroPasaporte === crearUsuarioDto.numeroPasaporte ||
        usuario.email === crearUsuarioDto.email,
    );

    if (existe) {
      throw new ConflictException(
        'Ya existe un usuario con este correo o pasaporte.',
      );
    }

    const nuevoUsuario: UsuarioEntidad = {
      id: crypto.randomUUID(), // Simulando ID generado por Supabase Auth
      ...crearUsuarioDto,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    this.baseDeDatosSimulada.push(nuevoUsuario);
    return nuevoUsuario;
  }

  obtenerTodos() {
    return this.baseDeDatosSimulada;
  }
}
