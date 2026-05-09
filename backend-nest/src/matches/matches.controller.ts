import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PartidosService } from './matches.service';
import { CrearPartidoDto } from './dto/create-match.dto';
import { ActualizarPartidoDto } from './dto/update-match.dto';
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

  /**
   * Endpoint PATCH /partidos/:id
   * Actualiza campos específicos de un partido existente.
   * PROTEGIDO: Solo accesible por ADMINISTRADORES.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarPartidoDto: ActualizarPartidoDto,
  ) {
    return await this.partidosService.actualizar(id, actualizarPartidoDto);
  }

  /**
   * Endpoint DELETE /partidos/:id
   * Elimina un partido y su inventario asociado (cascada en DB).
   * PROTEGIDO: Solo accesible por ADMINISTRADORES.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  async eliminar(@Param('id', ParseUUIDPipe) id: string) {
    await this.partidosService.eliminar(id);
    return { mensaje: `Partido con ID ${id} eliminado correctamente` };
  }
}
