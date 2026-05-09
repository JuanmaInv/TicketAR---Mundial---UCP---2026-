import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolUsuario } from '../enums/rol-usuario.enum';

/**
 * RolesGuard - El Guardia de Seguridad del Sistema.
 *
 * Flujo:
 * 1. Lee la "etiqueta" del endpoint (puesta por @Roles()).
 * 2. Extrae el rol del usuario desde el header 'x-user-role'.
 * 3. Compara: ¿el rol del usuario está en la lista de roles permitidos?
 * 4. Si sí → lo deja pasar. Si no → lanza error 403 (Prohibido).
 *
 * Nota: En producción, el rol debería venir del JWT/Token de autenticación.
 * Por ahora usamos un header para poder testear fácilmente.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. ¿Qué roles requiere este endpoint?
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no tiene @Roles(), es público → dejamos pasar
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    // 2. Extraemos el rol del usuario desde el request
    const request = context.switchToHttp().getRequest<Request>();
    const rolHeader = request.headers['x-user-role'];
    const rolUsuario = (
      Array.isArray(rolHeader) ? rolHeader[0] : rolHeader
    )?.toUpperCase();

    // 3. Validamos que el rol sea uno de los permitidos por el sistema
    if (
      !rolUsuario ||
      !Object.values(RolUsuario).includes(rolUsuario as RolUsuario)
    ) {
      throw new ForbiddenException(
        'Acceso denegado: Rol de usuario no válido o no proporcionado.',
      );
    }

    // 4. ¿El rol del usuario coincide con alguno de los requeridos?
    const tienePermiso = rolesRequeridos.includes(rolUsuario as RolUsuario);

    if (!tienePermiso) {
      throw new ForbiddenException(
        `Acceso denegado: Se requiere rol ${rolesRequeridos.join(' o ')}. Tu rol actual: ${rolUsuario}.`,
      );
    }

    return true;
  }
}
