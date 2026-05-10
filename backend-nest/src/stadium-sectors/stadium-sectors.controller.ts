import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SectoresService } from './stadium-sectors.service';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';

@Controller('sectores')
export class SectoresController {
  constructor(private readonly sectoresService: SectoresService) {}

  @Get()
  obtenerTodos() {
    return this.sectoresService.obtenerTodos();
  }



  /**
   * Retorna los sectores disponibles para un partido con stock real.
   * Endpoint usado por el frontend para mostrar sectores en el checkout.
   */
  @Get('partido/:idPartido')
  obtenerSectoresPorPartido(@Param('idPartido') idPartido: string) {
    return this.sectoresService.obtenerSectoresPorPartido(idPartido);
  }

  @Get('todos-partidos')
  obtenerSectoresTodosLosPartidos() {
    return this.sectoresService.obtenerSectoresTodosLosPartidos();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.sectoresService.obtenerUno(id);
  }

  @Post()
  crear(@Body() crearSectorDto: CrearSectorDto) {
    return this.sectoresService.crear(crearSectorDto);
  }
}
