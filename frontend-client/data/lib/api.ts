import { MOCK_TICKETS } from '../mock-tickets';
import { Ticket } from '../../types/ticket';

// La URL base vendrá de las variables de entorno en el futuro
const API_URL =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getTickets(): Promise<Ticket[]> {
  // Simulamos un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Por ahora devolvemos los mocks; 
  // cuando el backend esté listo, descomentamos la línea de abajo
  // return fetch(`${API_URL}/tickets`).then(res => res.json());

  return MOCK_TICKETS;
}

export async function createTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
  console.log('Enviando ticket al servidor (Simulado):', ticket);

  // Simulación de respuesta del servidor
  return {
    id: String(Math.floor(Math.random() * 1000)),
    ...ticket
  } as Ticket;
}
