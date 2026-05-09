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

export interface Usuario {
  id?: string;
  email: string;
  nombre?: string;
  apellido?: string;
  numeroPasaporte?: string;
  telefono?: string;
  provincia?: string;
  localidad?: string;
}

export interface PaymentResponse {
  ticket: Ticket;
  paymentResult?: {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    error?: string;
  };
}

type ApiSector = {
  id: string;
  nombre: string;
  precio: number;
  capacidad: number;
  capacidadDisponible?: number;
  capacidad_disponible?: number;
};

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(' ');
    return data.message || fallback;
  } catch {
    return fallback;
  }
};

export async function getPartidos(): Promise<Partido[]> {
  const res = await fetch(`${API_URL}/partidos`);
  if (!res.ok) throw new Error('Error al traer partidos');
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? data.items ?? []);
  return lista.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    equipo_local: (p.equipo_local ?? p.equipoLocal ?? '') as string,
    equipo_visitante: (p.equipo_visitante ?? p.equipoVisitante ?? '') as string,
    fecha_partido: (p.fecha_partido ?? p.fechaPartido ?? '') as string,
    nombre_estadio: (p.nombre_estadio ?? p.nombreEstadio ?? '') as string,
    precio_base: (p.precio_base ?? p.precioBase ?? 0) as number,
    fase: (p.fase ?? '') as string,
    estado: (p.estado ?? '') as string,
    imagen_url: (p.imagen_url ?? p.imagenUrl ?? undefined) as string | undefined,
  }));
}

export async function getSectores(partidoId?: string): Promise<Sector[]> {
  const endpoint = partidoId ? `/sectores/partido/${partidoId}` : '/sectores';
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Error al traer sectores'));
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? []);
  return lista.map((s: ApiSector) => ({
    id: s.id,
    nombre: s.nombre,
    precio: s.precio,
    capacidad: s.capacidad,
    capacidadDisponible: s.capacidadDisponible ?? s.capacidad_disponible
  }));
}


export async function createTicket(ticket: { idUsuario: string, idPartido: string, idSector: string }): Promise<Ticket> {
  const res = await fetch(`${API_URL}/entradas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'No pudimos reservar la entrada. Intentá nuevamente.'));
  }
  return res.json();
}

export async function getUsuario(email: string): Promise<Usuario | null> {
  const res = await fetch(`${API_URL}/usuarios/buscar?email=${email}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createUsuario(usuario: Usuario): Promise<boolean> {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  return res.ok;
}

export async function updateUsuario(email: string, usuario: Usuario): Promise<boolean> {
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

export async function pagarTicket(id: string): Promise<PaymentResponse> {
  const res = await fetch(`${API_URL}/entradas/${id}/pagar`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'No pudimos procesar el pago.'));
  return res.json();
}
