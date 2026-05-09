import { RolUsuario } from '../enums/rol-usuario.enum';

export interface RequestUser {
  id: string;
  email: string;
  rol: RolUsuario;
}
