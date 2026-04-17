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