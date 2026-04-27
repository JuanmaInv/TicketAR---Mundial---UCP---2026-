import { Ticket, Partido } from '../types/ticket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getPartidos(): Promise<Partido[]> {
  const res = await fetch(`${API_URL}/partidos`);
  if (!res.ok) throw new Error('Error al traer partidos');
  return res.json();
}

export async function getTickets(): Promise<Ticket[]> {
  // Función temporal para que el Home compile mientras migramos
  return [];
}

export async function createTicket(datos: { idUsuario: string; idSector: string }): Promise<Ticket> {
  const res = await fetch(`${API_URL}/entradas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al reservar en la base de datos');
  }
  return res.json();
}

export async function getUsuario(email: string) {
  const res = await fetch(`${API_URL}/usuarios/buscar?email=${email}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createUsuario(usuario: { email: string, nombre: string, apellido: string, numeroPasaporte: string }) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  return res.ok;
}

export async function updateUsuario(email: string, usuario: any) {
  const res = await fetch(`${API_URL}/usuarios/${email}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  return res.ok;
}