import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsuariosService } from '../../usuarios/usuarios.service';
import type { RequestUser } from '../interfaces/request-user.interface';

type RequestWithUser = Request & { currentUser?: RequestUser };

@Injectable()
export class AuthenticatedUserGuard implements CanActivate {
  constructor(private readonly usuariosService: UsuariosService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const idHeader = request.headers['x-user-id'];
    const emailHeader = request.headers['x-user-email'];

    const userId = Array.isArray(idHeader) ? idHeader[0] : idHeader;
    const userEmailRaw = Array.isArray(emailHeader)
      ? emailHeader[0]
      : emailHeader;
    const userEmail = userEmailRaw?.trim().toLowerCase();

    if (!userId || !userEmail) {
      throw new BadRequestException(
        'Se requieren los headers x-user-id y x-user-email.',
      );
    }

    const usuario = await this.usuariosService.buscarPorId(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no válido.');
    }

    if (usuario.email.trim().toLowerCase() !== userEmail) {
      throw new UnauthorizedException('La identidad del usuario no coincide.');
    }

    request.currentUser = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return true;
  }
}
