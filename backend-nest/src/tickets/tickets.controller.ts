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

  /**
   * Devuelve el código QR de una entrada pagada como imagen Base64.
   *
   * El frontend puede mostrar este QR directamente en la página "Mis Entradas"
   * usando: <img src={qrDataUrl} />
   *
   * Sólo funciona si el ticket tiene estado PAGADO.
   * En el estadio, el guardia escanea este QR y el backend valida la identidad.
   */
  @Get(':id/qr')
  obtenerQr(@Param('id') id: string) {
    return this.entradasService.obtenerQr(id);
  }
}
