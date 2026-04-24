import { Ticket, Partido } from '../types/ticket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getPartidos(): Promise<Partido[]> {
  // Ya no hay setTimeout, ahora es una petición real al Back de Erwin
  const res = await fetch(`${API_URL}/partidos`);
  if (!res.ok) throw new Error('Error al traer partidos');
  return res.json();
}

export async function getTickets(): Promise<Ticket[]> {
  // Función temporal para que el Home compile mientras migramos
  return [];
}

export async function createTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
  const res = await fetch(`${API_URL}/entradas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
  if (!res.ok) throw new Error('Error al reservar');
  return res.json();
}