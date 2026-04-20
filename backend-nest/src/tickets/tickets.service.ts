import { Injectable, ConflictException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class TicketsService {
  // Mock Database
  private mockDatabase: TicketEntity[] = [];

  create(createTicketDto: CreateTicketDto) {
    // 🚨 Regla Crítica: Máximo 1 entrada por sesión por usuario
    // Validamos si el usuario ya tiene un ticket activo (RESERVED o PAID)
    const activeTicket = this.mockDatabase.find(
      ticket => ticket.userId === createTicketDto.userId && 
                (ticket.status === TicketStatus.RESERVED || ticket.status === TicketStatus.PAID)
    );

    if (activeTicket) {
      throw new ConflictException('El usuario ya tiene una entrada activa o en reserva.');
    }

    // 🚨 Reserva: El servidor bloquea el lugar por 15 min
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const newTicket: TicketEntity = {
      id: crypto.randomUUID(),
      ...createTicketDto,
      status: TicketStatus.RESERVED,
      reservationExpiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockDatabase.push(newTicket);
    return newTicket;
  }

  findAll() {
    return this.mockDatabase;
  }

  findOne(id: string) {
    return this.mockDatabase.find(ticket => ticket.id === id);
  }

  markAsPaid(id: string) {
    const ticket = this.findOne(id);
    if (ticket) {
      ticket.status = TicketStatus.PAID;
      ticket.updatedAt = new Date();
    }
    return ticket;
  }
}
