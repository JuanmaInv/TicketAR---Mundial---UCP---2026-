import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PartidosService } from './matches.service';
import { CrearPartidoDto } from './dto/create-match.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums/rol-usuario.enum';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  /**
   * Endpoint POST /partidos
   * Crea un partido recibiendo los datos en el Body.
   * PROTEGIDO: Solo accesible por ADMINISTRADORES.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  async crear(@Body() crearPartidoDto: CrearPartidoDto) {
    return await this.partidosService.crear(crearPartidoDto);
  }

  /**
   * Endpoint GET /partidos
   * Retorna la lista de todos los partidos registrados.
   * PÚBLICO: Cualquier usuario puede ver los partidos.
   */
  @Get()
  async obtenerTodos() {
    return await this.partidosService.obtenerTodos();
  }
}
