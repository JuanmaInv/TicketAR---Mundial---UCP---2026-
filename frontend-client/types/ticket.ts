export interface Partido {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fecha: string;
  estadio: string;
  precioBase: number;
  imagenUrl?: string;
}