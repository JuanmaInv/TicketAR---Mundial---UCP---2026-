export class PartidoEntidad {
  id: string; // UUID de Supabase
  equipoLocal: string;
  equipoVisitante: string;
  fechaPartido: Date;
  nombreEstadio: string;
  fase: string;
  precioBase: number;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
