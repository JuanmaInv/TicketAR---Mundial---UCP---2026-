import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  // Uso de GET, definición de rutas y devolución de JSON
  @Get()
  getAllTickets() {
    // Devuelve un JSON (NestJS lo hace automáticamente con objetos/arreglos)
    return [
      { id: 1, sector: 'PLATEA', passport: 'AB123456', status: 'confirmed' },
      { id: 2, sector: 'POPULAR', passport: 'XY987654', status: 'reserved' },
    ];
  }

  // Uso de POST, recepción de parámetros (Body) y devolución de JSON
  @Post()
  createTicketReservation(@Body() ticketData: CreateTicketDto) {

    return {
      message: 'Reserva recibida exitosamente',
      receivedData: ticketData,
      expiresIn: '15 minutos',
    };
  }
}
