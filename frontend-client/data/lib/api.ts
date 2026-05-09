import { MOCK_TICKETS } from '../mock-tickets';
import { Ticket } from '../../types/ticket';

export async function getTickets(): Promise<Ticket[]> {
  // Simulamos un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Por ahora devolvemos los mocks; 
  // cuando el backend esté listo, descomentamos la línea de abajo
  // return fetch(`${API_URL}/tickets`).then(res => res.json());

  return MOCK_TICKETS;
}

export async function createTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
  // Simulación de respuesta del servidor
  return {
    id: String(Math.floor(Math.random() * 1000)),
    ...ticket
  } as Ticket;
}
