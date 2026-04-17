// Interfaz para el Paso 1: Partidos
export interface Partido {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fecha: string;
  estadio: string;
  precioBase: number;
  imagenUrl?: string;
}

// Interfaz para el Paso 2: Formulario de Datos del Comprador
// Incluye las validaciones obligatorias
export interface DatosCompra {
  partidoId: string;
  nombreComprador: string;
  dni: string;
  localidad: string;
  provincia: string;
  // Regla: solo se permiten entre 1 y 6 entradas
  cantidad: 1 | 2 | 3 | 4 | 5 | 6;
}

// Interfaz para los sectores del estadio (Ubicaciones)
export interface Sector {
  nombre: string;     // Ej: "Platea Alta", "General"
  precio: number;
  capacidad: number;
  disponibles: number;
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
}

//el backend tendra que tener una base de datos con las tablas: partidos, sectores, tickets y usuarios.
///con la siguiente estructura o similar:
//en partidos estaran los partidos (id, equipoLocal, equipoVisitante, fecha, estadio, precioBase, imagenUrl)
//en sectores estaran los sectores (id, partidoId, nombre, precio, capacidad, disponibles)
//en tickets estaran los tickets (id, partidoId, sectorId, precio, estado, fechaCreacion, idUsuario)
//en usuarios estaran los usuarios (id, nombre, email de contacto, telefono, password?)