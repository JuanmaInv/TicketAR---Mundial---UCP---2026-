import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
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
}
