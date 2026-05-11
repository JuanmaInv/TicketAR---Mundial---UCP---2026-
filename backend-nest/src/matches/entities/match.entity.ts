export class PartidoEntidad {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fechaPartido: string;
  nombreEstadio: string;
  fase: string;
  estado: string; // disponible, agotado, cancelado
  fechaCreacion?: string;
  fechaActualizacion?: string;
}
