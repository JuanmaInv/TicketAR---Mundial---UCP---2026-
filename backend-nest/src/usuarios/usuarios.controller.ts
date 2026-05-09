import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Put,
  Param,
  Req,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { AuthenticatedUserGuard } from '../common/guards/authenticated-user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums/rol-usuario.enum';

interface ActualizarUsuarioBody {
  email?: string;
  [clave: string]: unknown;
}

type RequestWithUser = Request & { currentUser?: RequestUser };

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crear(crearUsuarioDto);
  }

  @Get()
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  obtenerTodos() {
    return this.usuariosService.obtenerTodos();
  }

  @Get('buscar')
  @UseGuards(AuthenticatedUserGuard)
  buscarPorEmail(@Query('email') email: string, @Req() req: RequestWithUser) {
    const usuarioAutenticado = req.currentUser;
    if (!usuarioAutenticado) {
      throw new ForbiddenException('Usuario no autenticado.');
    }
    const emailNormalizado = email.trim().toLowerCase();
    if (
      usuarioAutenticado.rol !== RolUsuario.ADMINISTRADOR &&
      usuarioAutenticado.email.trim().toLowerCase() !== emailNormalizado
    ) {
      throw new ForbiddenException(
        'No tenés permiso para consultar datos de otros usuarios.',
      );
    }
    return this.usuariosService.buscarPorEmail(email);
  }

  @Put(':email')
  @UseGuards(AuthenticatedUserGuard)
  actualizar(
    @Param('email') email: string,
    @Body() datos: Record<string, unknown>,
    @Req() req: RequestWithUser,
  ) {
    const usuarioAutenticado = req.currentUser;
    if (!usuarioAutenticado) {
      throw new ForbiddenException('Usuario no autenticado.');
    }
    const emailNormalizado = email.trim().toLowerCase();
    if (
      usuarioAutenticado.rol !== RolUsuario.ADMINISTRADOR &&
      usuarioAutenticado.email.trim().toLowerCase() !== emailNormalizado
    ) {
      throw new ForbiddenException(
        'No tenés permiso para actualizar datos de otros usuarios.',
      );
    }
    return this.usuariosService.actualizar(email, datos);
  }

  @Put()
  @UseGuards(AuthenticatedUserGuard)
  actualizarPorBody(
    @Body() datos: ActualizarUsuarioBody,
    @Req() req: RequestWithUser,
  ) {
    const email = typeof datos.email === 'string' ? datos.email : '';
    if (!email) {
      throw new BadRequestException(
        'El email es obligatorio para actualizar el usuario.',
      );
    }
    const usuarioAutenticado = req.currentUser;
    if (!usuarioAutenticado) {
      throw new ForbiddenException('Usuario no autenticado.');
    }
    const emailNormalizado = email.trim().toLowerCase();
    if (
      usuarioAutenticado.rol !== RolUsuario.ADMINISTRADOR &&
      usuarioAutenticado.email.trim().toLowerCase() !== emailNormalizado
    ) {
      throw new ForbiddenException(
        'No tenés permiso para actualizar datos de otros usuarios.',
      );
    }
    return this.usuariosService.actualizar(email, datos);
  }

  /**
   * Endpoint DELETE /usuarios/me
   * Permite al usuario darse de baja y eliminar toda su información.
   * La DB se encarga de la eliminación en cascada (entradas, reservas).
   * Cumple con el "Derecho al Olvido".
   *
   * NOTA: Hasta implementar JWT, el ID del usuario se envía via header x-user-id.
   */
  @Delete('me')
  @UseGuards(AuthenticatedUserGuard)
  async darDeBaja(@Req() req: RequestWithUser) {
    const usuarioAutenticado = req.currentUser;
    if (!usuarioAutenticado) {
      throw new ForbiddenException('Usuario no autenticado.');
    }
    await this.usuariosService.eliminar(usuarioAutenticado.id);
    return {
      mensaje:
        'Tu cuenta y todos tus registros asociados han sido eliminados correctamente.',
    };
  }
}
