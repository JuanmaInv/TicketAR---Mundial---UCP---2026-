export class PartidoEntidad {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fechaPartido: Date;
  nombreEstadio: string;
  fase: string;
  precioBase: number;
  estado: string;
  fechaCreacion?: Date;
}
