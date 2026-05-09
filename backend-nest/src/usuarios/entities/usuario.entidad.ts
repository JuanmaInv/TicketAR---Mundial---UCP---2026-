import { RolUsuario } from '../../common/enums/rol-usuario.enum';

export class UsuarioEntidad {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  numeroPasaporte: string;
  rol: RolUsuario;
  telefono?: string;
  localidad?: string;
  provincia?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
