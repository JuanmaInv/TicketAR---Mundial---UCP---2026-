import { Ticket, Partido } from '../types/ticket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
};

export interface Sector {
  id: string;
  nombre: string;
  precio: number;
  capacidad: number;
  capacidadDisponible: number;
}

export async function getPartidos(): Promise<Partido[]> {
  const res = await fetch(`${API_URL}/partidos`);
  if (!res.ok) throw new Error('Error al traer partidos');
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? data.items ?? []);
  return lista.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    equipoLocal: (p.equipoLocal || p.equipo_local || '') as string,
    equipoVisitante: (p.equipoVisitante || p.equipo_visitante || '') as string,
    fechaPartido: (p.fechaPartido || p.fecha_partido || '') as string,
    nombreEstadio: (p.nombreEstadio || p.nombre_estadio || '') as string,
    precioBase: (p.precioBase || p.precio_base || 0) as number,
    fase: (p.fase || '') as string,
    estado: (p.estado || '') as string,
    imagenUrl: (p.imagenUrl || p.imagen_url || undefined) as string | undefined,
  }));
}

export async function getSectores(): Promise<Sector[]> {
  const res = await fetch(`${API_URL}/sectores`);
  if (!res.ok) throw new Error('Error al traer sectores');
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? []);
  return lista.map((s: Record<string, unknown>) => ({
    id: s.id as string,
    nombre: s.nombre as string,
    precio: s.precio as number,
    capacidad: s.capacidad as number,
    capacidadDisponible: (s.capacidadDisponible ?? s.capacidad_disponible ?? 0) as number
  }));
}

export async function createTicket(ticket: { idUsuario: string, idPartido: string, idSector: string }): Promise<Ticket> {
  const res = await fetch(`${API_URL}/entradas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al reservar');
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

export async function updateUsuario(email: string, usuario: Partial<{ nombre: string; apellido: string; numeroPasaporte: string; telefono: string; localidad: string; provincia: string }>) {
  const res = await fetch(`${API_URL}/usuarios/${email}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  return res.ok;
}

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_URL}/entradas`);
  if (!res.ok) throw new Error('Error al traer tickets');
  return res.json();
}

export async function getTicketQr(id: string): Promise<string> {
  const res = await fetch(`${API_URL}/entradas/${id}/qr`);
  if (!res.ok) throw new Error('QR no disponible');
  const data = await res.json();
  return data.qrDataUrl;
}

export async function pagarTicket(id: string): Promise<{ paymentResult?: { paymentUrl: string } }> {
  const res = await fetch(`${API_URL}/entradas/${id}/pagar`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al procesar el pago');
  return res.json();
}