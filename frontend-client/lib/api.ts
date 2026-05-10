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
  const rutaValida = /^\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/;
  if (!rutaValida.test(ruta) || ruta.includes('://') || ruta.startsWith('//')) {
    throw new Error('Ruta de API invalida.');
  }
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
  activo?: boolean;
}

export interface SectorPorPartido {
  id: string;
  idSector: string;
  nombre: string;
  precio: number;
  asientosDisponibles: number;
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
  rol?: string;
}

export function esRolAdmin(rol?: string): boolean {
  const normalizado = (rol ?? '').trim().toUpperCase();
  return normalizado === 'ADMINISTRADOR' || normalizado === 'ADMIN';
}

export interface StatsPorSector {
  sector: string;
  cantidad: number;
  ingresos: number;
}

export interface StatsPorPartido {
  partido: string;
  entradasVendidas: number;
  ingresos: number;
}

export interface EstadisticasAdmin {
  ingresosTotales: number;
  entradasVendidas: number;
  entradasPendientes: number;
  desglosePorSector: StatsPorSector[];
  ventasPorPartido: StatsPorPartido[];
  proximoPartidoOcupacion: {
    partido: string;
    porcentaje: number;
  };
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

type SectorGeneralApi = {
  id: string;
  nombre: string;
  precio: number;
  capacidad: number;
  activo?: boolean;
};

type SectorPorPartidoApi = {
  id: string;
  idSector?: string;
  id_sector?: string;
  nombre: string;
  precio: number;
  asientosDisponibles?: number;
  asientos_disponibles?: number;
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

function validarIdRutaSeguro(id: string, nombre: string): string {
  const valor = id.trim();
  const idSeguro = /^[a-zA-Z0-9_-]{1,80}$/;
  if (!idSeguro.test(valor)) {
    throw new Error(`El ${nombre} no es valido.`);
  }
  return valor;
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
    fase: (p.fase ?? '') as string,
    estado: (p.estado ?? '') as string,
    imagen_url: (p.imagen_url ?? p.imagenUrl ?? undefined) as string | undefined,
  }));
}

export async function getSectores(): Promise<Sector[]> {
  const res = await fetch(construirUrlApi('/sectores'));
  if (!res.ok) throw new Error(await obtenerMensajeErrorApi(res, 'Error al traer sectores'));
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? []);

  return lista.map((s: SectorGeneralApi) => ({
    id: s.id,
    nombre: s.nombre,
    precio: s.precio,
    capacidad: s.capacidad,
    activo: s.activo,
  }));
}

export async function getSectoresPorPartido(idPartido: string): Promise<SectorPorPartido[]> {
  const idPartidoSeguro = validarIdRutaSeguro(idPartido, 'identificador de partido');
  const res = await fetch(construirUrlApi(`/sectores/partido/${idPartidoSeguro}`));
  if (!res.ok) throw new Error(await obtenerMensajeErrorApi(res, 'Error al traer sectores por partido'));
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? []);

  return lista.map((s: SectorPorPartidoApi) => {
    const idSector = s.idSector ?? s.id_sector;
    if (!idSector) {
      throw new Error('El sector recibido no incluye idSector.');
    }

    return {
      id: s.id,
      idSector,
      nombre: s.nombre,
      precio: s.precio,
      asientosDisponibles:
        s.asientosDisponibles ??
        s.asientos_disponibles ??
        s.capacidadDisponible ??
        s.capacidad_disponible ??
        0,
    };
  });
}

export async function getSectoresDeTodosLosPartidos(): Promise<{ idPartido: string; sectores: SectorPorPartido[] }[]> {
  const res = await fetch(construirUrlApi('/sectores/todos-partidos'));
  if (!res.ok) throw new Error(await obtenerMensajeErrorApi(res, 'Error al traer sectores de todos los partidos'));
  const data = await res.json();
  const lista = Array.isArray(data) ? data : (data.data ?? []);

  return lista.map((item: { idPartido?: string; id_partido?: string; sectores?: SectorPorPartidoApi[] }) => ({
    idPartido: (item.idPartido ?? item.id_partido ?? '') as string,
    sectores: (item.sectores ?? []).map((s) => {
      const idSector = s.idSector ?? s.id_sector;
      if (!idSector) {
        throw new Error('El sector recibido no incluye idSector.');
      }

      return {
        id: s.id,
        idSector,
        nombre: s.nombre,
        precio: s.precio,
        asientosDisponibles:
          s.asientosDisponibles ??
          s.asientos_disponibles ??
          s.capacidadDisponible ??
          s.capacidad_disponible ??
          0,
      };
    }),
  }));
}

export async function createTicket(ticket: { idUsuario: string; idPartido: string; idSector: string; cantidad: number }): Promise<Ticket> {
  const res = await fetch(construirUrlApi('/entradas'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
  if (!res.ok) {
    throw new Error(await obtenerMensajeErrorApi(res, 'No pudimos reservar la entrada. Intenta nuevamente.'));
  }
  return res.json();
}

export async function getUsuario(
  email: string,
  auth: AuthHeaders,
): Promise<Usuario | null> {
  const emailSeguro = validarEmailSeguro(email);
  const res = await fetch(construirUrlApi('/usuarios/me'), {
    headers: construirHeadersUsuario(auth),
  });
  if (!res.ok) return null;
  const usuario = (await res.json()) as Usuario | null;
  if (!usuario?.email) return null;
  return usuario.email.trim().toLowerCase() === emailSeguro ? usuario : null;
}

export async function createUsuario(usuario: Usuario): Promise<void> {
  const res = await fetch(construirUrlApi('/usuarios'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) {
    throw new Error(
      await obtenerMensajeErrorApi(res, 'No pudimos crear tu perfil.'),
    );
  }
}

export async function updateUsuario(
  email: string,
  usuario: Usuario,
  auth: AuthHeaders,
): Promise<void> {
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
  if (!res.ok) {
    throw new Error(
      await obtenerMensajeErrorApi(res, 'No pudimos actualizar tu perfil.'),
    );
  }
}

export async function deleteUsuario(email: string): Promise<boolean> {
  const emailSeguro = validarEmailSeguro(email);
  const res = await fetch(construirUrlApi(`/usuarios/${encodeURIComponent(emailSeguro)}`), {
    method: 'DELETE',
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
  const idSeguro = validarIdRutaSeguro(id, 'identificador de entrada');
  const res = await fetch('/api/tickets/qr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: idSeguro }),
  });
  if (!res.ok) throw new Error('QR no disponible');
  const data = (await res.json()) as { qrDataUrl: string };
  return data.qrDataUrl;
}

export async function pagarTicket(id: string): Promise<RespuestaPago> {
  const idSeguro = validarIdRutaSeguro(id, 'identificador de entrada');
  const res = await fetch('/api/tickets/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: idSeguro }),
  });
  if (!res.ok) throw new Error(await obtenerMensajeErrorApi(res, 'No pudimos procesar el pago.'));
  const respuesta = (await res.json()) as { ticket: Ticket; paymentResult?: RespuestaPago['resultadoPago'] };
  return {
    entrada: respuesta.ticket,
    resultadoPago: respuesta.paymentResult,
  };
}

export interface ActualizarPartidoPayload {
  equipoLocal?: string;
  equipoVisitante?: string;
  fechaPartido?: string;
  nombreEstadio?: string;
  fase?: string;
  estado?: string;
}

export async function actualizarPartidoAdmin(
  partidoId: string,
  payload: ActualizarPartidoPayload,
  auth: AuthHeaders,
): Promise<void> {
  const partidoIdSeguro = validarIdRutaSeguro(
    partidoId,
    'identificador de partido',
  );
  const res = await fetch('/api/admin/matches/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partidoId: partidoIdSeguro,
      payload,
      auth,
    }),
  });

  if (!res.ok) {
    throw new Error(
      await obtenerMensajeErrorApi(
        res,
        'No pudimos actualizar el partido en este momento.',
      ),
    );
  }
}

export async function getEstadisticasAdmin(
  auth: AuthHeaders,
): Promise<EstadisticasAdmin> {
  const res = await fetch(construirUrlApi('/estadisticas'), {
    headers: construirHeadersUsuario(auth),
  });
  if (!res.ok) {
    throw new Error(
      await obtenerMensajeErrorApi(
        res,
        'No pudimos cargar las estadisticas de administrador.',
      ),
    );
  }
  return (await res.json()) as EstadisticasAdmin;
}

export interface ActualizarSectorPartidoPayload {
  precio?: number;
  asientosDisponibles?: number;
}

export async function actualizarSectorPartidoAdmin(
  partidoId: string,
  sectorId: string,
  payload: ActualizarSectorPartidoPayload,
  auth: AuthHeaders,
): Promise<void> {
  const partidoIdSeguro = validarIdRutaSeguro(
    partidoId,
    'identificador de partido',
  );
  const sectorIdSeguro = validarIdRutaSeguro(
    sectorId,
    'identificador de sector',
  );

  const payloadCompat: {
    precio?: number;
    asientosDisponibles?: number;
    capacidadDisponible?: number;
  } = {
    precio: payload.precio,
    asientosDisponibles: payload.asientosDisponibles,
    capacidadDisponible: payload.asientosDisponibles,
  };

  const res = await fetch('/api/admin/matches/sector/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partidoId: partidoIdSeguro,
      sectorId: sectorIdSeguro,
      payload: payloadCompat,
      auth,
    }),
  });

  if (!res.ok) {
    throw new Error(
      await obtenerMensajeErrorApi(
        res,
        'No pudimos actualizar los datos del sector.',
      ),
    );
  }
}
