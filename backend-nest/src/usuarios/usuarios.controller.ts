import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Put,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

interface ActualizarUsuarioBody {
  email?: string;
  [clave: string]: unknown;
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crear(crearUsuarioDto);
  }

  @Get()
  obtenerTodos() {
    return this.usuariosService.obtenerTodos();
  }

  @Get('buscar')
  buscarPorEmail(@Query('email') email: string) {
    return this.usuariosService.buscarPorEmail(email);
  }

  @Put(':email')
  actualizar(
    @Param('email') email: string,
    @Body() datos: Record<string, unknown>,
  ) {
    return this.usuariosService.actualizar(email, datos);
  }

  @Put()
  actualizarPorBody(@Body() datos: ActualizarUsuarioBody) {
    const email = typeof datos.email === 'string' ? datos.email : '';
    if (!email) {
      throw new BadRequestException(
        'El email es obligatorio para actualizar el usuario.',
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
  async darDeBaja(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException(
        'Se requiere el header x-user-id para identificar al usuario',
      );
    }

    await this.usuariosService.eliminar(userId);
    return {
      mensaje:
        'Tu cuenta y todos tus registros asociados han sido eliminados correctamente.',
    };
  }
}
