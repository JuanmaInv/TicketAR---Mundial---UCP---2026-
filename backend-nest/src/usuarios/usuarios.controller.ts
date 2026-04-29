import { Controller, Get, Post, Body, Query, Put, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

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
  actualizar(@Param('email') email: string, @Body() datos: any) {
    return this.usuariosService.actualizar(email, datos);
  }
}
