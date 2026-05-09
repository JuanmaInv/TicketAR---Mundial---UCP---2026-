import { Ticket, Partido } from '../types/ticket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function obtenerBaseApiSegura(): URL {
  const base = new URL(API_URL);
  const protocoloValido = base.protocol === 'http:' || base.protocol === 'https:';

  if (!protocoloValido || base.username || base.password) {
    throw new Error('La configuracion de NEXT_PUBLIC_API_URL es invalida.');
  }

  return base;
}

const BASE_API_SEGURA = obtenerBaseApiSegura();

function construirUrlApi(ruta: string): string {
  return new URL(ruta, BASE_API_SEGURA).toString();
}

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

interface AuthHeaders {
  userId: string;
  userEmail: string;
}

function construirHeadersUsuario(auth: AuthHeaders): HeadersInit {
  return {
    'x-user-id': auth.userId,
    'x-user-email': auth.userEmail,
  };
}

export interface RespuestaPago {
  entrada: Ticket;
  resultadoPago?: {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    error?: string;
  };
}

type SectorApi = {
  id: string;
  nombre: string;
  precio: number;
  capacidad: number;
  capacidadDisponible?: number;
  capacidad_disponible?: number;
};

function validarEmailSeguro(email: string): string {
  const emailNormalizado = email.trim().toLowerCase();
  const regexEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!regexEmail.test(emailNormalizado) || emailNormalizado.length > 254) {
    throw new Error('Email invalido.');
  }
  return emailNormalizado;
}

async function obtenerMensajeErrorApi(respuesta: Response, mensajePorDefecto: string): Promise<string> {
  try {
    const datos = (await respuesta.json()) as { message?: string | string[] };
    if (Array.isArray(datos.message)) return datos.message.join(' ');
    return datos.message || mensajePorDefecto;
  } catch {
    return mensajePorDefecto;
  }
}

export async function getPartidos(): Promise<Partido[]> {
  const res = await fetch(construirUrlApi('/partidos'));
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
  const ruta = partidoId ? `/sectores/partido/${partidoId}` : '/sectores';
  const res = await fetch(construirUrlApi(ruta));
  if (!res.ok) throw new Error(await obtenerMensajeErrorApi(res, 'Error al traer sectores'));
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? []);
  return lista.map((s: SectorApi) => ({
    id: s.id,
    nombre: s.nombre,
    precio: s.precio,
    capacidad: s.capacidad,
    capacidadDisponible: s.capacidadDisponible ?? s.capacidad_disponible
  }));
}


export async function createTicket(entrada: { idUsuario: string, idPartido: string, idSector: string }): Promise<Ticket> {
  const res = await fetch(construirUrlApi('/entradas'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entrada),
  });
  if (!res.ok) {
    throw new Error(await obtenerMensajeErrorApi(res, 'No pudimos reservar la entrada. Intentá nuevamente.'));
  }
  return res.json();
}

export async function getUsuario(
  email: string,
  auth: AuthHeaders,
): Promise<Usuario | null> {
  const emailSeguro = validarEmailSeguro(email);
  const ruta = `/usuarios/buscar?email=${encodeURIComponent(emailSeguro)}`;
  const res = await fetch(construirUrlApi(ruta), {
    headers: construirHeadersUsuario(auth),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createUsuario(usuario: Usuario): Promise<boolean> {
  const res = await fetch(construirUrlApi('/usuarios'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  return res.ok;
}

export async function updateUsuario(
  email: string,
  usuario: Usuario,
  auth: AuthHeaders,
): Promise<boolean> {
  const emailSeguro = validarEmailSeguro(email);
  const res = await fetch(construirUrlApi('/usuarios'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...construirHeadersUsuario(auth),
    },
    body: JSON.stringify({
      ...usuario,
      email: emailSeguro,
    }),
  });
  return res.ok;
}

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(construirUrlApi('/entradas'));
  if (!res.ok) throw new Error('Error al traer entradas');
  return res.json();
}

export async function eliminarMiCuenta(auth: AuthHeaders): Promise<void> {
  const res = await fetch(construirUrlApi('/usuarios/me'), {
    method: 'DELETE',
    headers: construirHeadersUsuario(auth),
  });
  if (!res.ok) {
    throw new Error(
      await obtenerMensajeErrorApi(
        res,
        'No pudimos eliminar tu cuenta en este momento.',
      ),
    );
  }
}

export async function getTicketQr(id: string): Promise<string> {
  const res = await fetch(construirUrlApi(`/entradas/${id}/qr`));
  if (!res.ok) throw new Error('QR no disponible');
  const data = await res.json();
  return data.qrDataUrl;
}

export async function pagarTicket(id: string): Promise<RespuestaPago> {
  const res = await fetch(construirUrlApi(`/entradas/${id}/pagar`), {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await obtenerMensajeErrorApi(res, 'No pudimos procesar el pago.'));
  const respuesta = await res.json();
  return {
    entrada: respuesta.ticket,
    resultadoPago: respuesta.paymentResult,
  };
}
