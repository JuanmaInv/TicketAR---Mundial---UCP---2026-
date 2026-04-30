import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EntradasService } from './tickets.service';
import { CrearEntradaDto } from './dto/create-ticket.dto';

@Controller('entradas')
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) {}

  @Post()
  crear(@Body() crearEntradaDto: CrearEntradaDto) {
    return this.entradasService.crear(crearEntradaDto);
  }

  @Get()
  obtenerTodas() {
    return this.entradasService.obtenerTodas();
  }

  @Post(':id/pagar')
  pagar(@Param('id') id: string) {
    return this.entradasService.pagar(id);
  }
}
