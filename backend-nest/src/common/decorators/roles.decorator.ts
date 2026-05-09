import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../enums/rol-usuario.enum';

/**
 * Decorador personalizado @Roles()
 * Se usa para "etiquetar" un endpoint con los roles que tienen permiso de acceso.
 * Ejemplo: @Roles(RolUsuario.ADMINISTRADOR) → Solo admins pueden entrar.
 *
 * Internamente, guarda los roles como metadata que luego el RolesGuard lee.
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
