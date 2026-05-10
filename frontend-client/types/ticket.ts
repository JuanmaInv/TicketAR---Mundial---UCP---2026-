// Interfaz para el Paso 1: Partidos
export interface Partido {
  id: string;
  equipo_local: string;      // Cambiado para coincidir con SQL
  equipo_visitante: string;  // Cambiado
  fecha_partido: string;     // Cambiado
  nombre_estadio: string;    // Cambiado
  fase: string;
  estado: string;
  imagen_url?: string;       // Nuevo campo para imagen (agregar a DB de partidos)
}

// Interfaz para el Paso 2: Formulario de Datos del Comprador
// Incluye las validaciones obligatorias
export interface DatosCompra {
  partidoId: string;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  provincia: string;
  localidad: string;
  // Regla: solo se permiten entre 1 y 6 entradas
  cantidad: 1 | 2 | 3 | 4 | 5 | 6;
}

// Interfaz para los sectores del estadio (Ubicaciones)
export interface Sector {
  id: string;
  nombre: string;     // Ej: "Platea Alta", "General"
  precio: number;
  capacidad: number;
}

// Sector por Partido (con stock real)
export interface SectorPorPartido {
  id: string; // ID en partido_sectores
  idSector: string; // ID en sectores_estadio
  nombre: string;
  precio: number;
  asientosDisponibles: number;
}

// Interfaz para el Paso 3: Ticket generado y estado de pago
export interface Ticket {
  id: string // ID del ticket
  partidoId: string; // ID del partido
  sector: string; // Sector del estadio
  precio: number; // Precio del ticket
  // Estados para manejar el flujo de reserva y confirmacion
  // disponible: el ticket está disponible para la venta
  // pendiente: el ticket está pendiente de pago (por error no se pudo pagar, entonces deja reservado a esa persona el ticket durante 15 minutos)
  // vendido: el ticket ha sido vendido
  estado: 'disponible' | 'pendiente' | 'vendido';
  fechaCreacion?: string; // Fecha de creacion del ticket

  // Agregamos opcionalmente los campos del comprador para evitar errores de TS en el flujo
  nombre?: string;
  apellido?: string;
  email?: string;
  documento?: string;
  telefono?: string;
  localidad?: string;
  provincia?: string;
  cantidad?: number;
  fechaCompra?: string;
}

//el backend tendra que tener una base de datos con las tablas: partidos, sectores, tickets y usuarios.
///con la siguiente estructura o similar:
//en partidos estaran los partidos (id, equipoLocal, equipoVisitante, fecha, estadio, precioBase, imagenUrl)
//en sectores estaran los sectores (id, partidoId, nombre, precio, capacidad, disponibles)
//en tickets estaran los tickets (id, partidoId, sectorId, precio, estado, fechaCreacion, idUsuario)
//en usuarios estaran los usuarios (id, nombre, email de contacto, telefono, password?)