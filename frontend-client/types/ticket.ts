// Interfaz para el Paso 1: Partidos (Adaptada al Backend)
export interface Partido {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fechaPartido: string;
  nombreEstadio: string;
  precioBase: number;
  fase: string;
  estado: string;
  imagenUrl?: string;
}

// Interfaz para el Paso 2: Formulario de Datos del Comprador
export interface DatosCompra {
  partidoId: string;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  provincia: string;
  localidad: string;
  cantidad: number;
}

// Interfaz para los sectores del estadio (Ubicaciones)
export interface Sector {
  id: string;
  nombre: string;
  precio: number;
  capacidad: number;
  capacidadDisponible: number;
}

// Interfaz para el Paso 3: Ticket generado y estado de pago
export interface Ticket {
  id: string;
  idPartido?: string;
  idSector?: string;
  precio: number;
  estado: 'disponible' | 'pendiente' | 'vendido' | 'PAGADO' | 'RESERVADO' | 'reservado' | 'CANCELADO';
  fechaCreacion?: string;
  idUsuario?: string;
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