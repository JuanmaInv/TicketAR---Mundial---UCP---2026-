import { Controller, Get, Post, Body } from '@nestjs/common';
import { PartidosService } from './matches.service';
import { CrearPartidoDto } from './dto/create-match.dto';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) { }

  /**
   * Endpoint POST /partidos
   * Crea un partido recibiendo los datos en el Body.
   */
  @Post()
  async crear(@Body() crearPartidoDto: CrearPartidoDto) {
    return await this.partidosService.crear(crearPartidoDto);
  }

  /**
   * Endpoint GET /partidos
   * Retorna la lista de todos los partidos registrados.
   */
  @Get()
  async obtenerTodos() {
    return await this.partidosService.obtenerTodos();
  }
}
