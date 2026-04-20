import { Controller, Get, Post, Body } from '@nestjs/common';
import { PartidosService } from './matches.service';
import { CrearPartidoDto } from './dto/create-match.dto';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Post()
  crear(@Body() crearPartidoDto: CrearPartidoDto) {
    return this.partidosService.crear(crearPartidoDto);
  }

  @Get()
  obtenerTodos() {
    return this.partidosService.obtenerTodos();
  }
}
