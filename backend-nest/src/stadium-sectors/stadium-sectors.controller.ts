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

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.sectoresService.obtenerUno(id);
  }

  @Post()
  crear(@Body() crearSectorDto: CrearSectorDto) {
    return this.sectoresService.crear(crearSectorDto);
  }
}
